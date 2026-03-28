import { prisma } from '../../config/database';
import {
  Announcement,
  AnnouncementCategory,
  Role,
  User
} from '@prisma/client';
import { uploadService } from '../../shared/services/upload.service';
import { logger } from '../../shared/services/logger.service';
import { cacheService } from '../../shared/services/cache.service';
import { config } from '../../shared/config/config';
import { CreateAnnouncementInput, UpdateAnnouncementInput, GetAnnouncementsInput } from './announcement.validation';
import { notificationService } from '../notifications/notification.service';
import { emitToAll, emitToHostel } from '../../shared/socket';

interface AnnouncementWithRelations extends Announcement {
  hostel?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    comments: number;
    reactions: number;
  };
  isRead?: boolean;
}

interface PaginatedAnnouncements {
  announcements: AnnouncementWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount: number;
}

class AnnouncementService {
  private prisma = prisma;

  async createAnnouncement(
    data: CreateAnnouncementInput,
    files: { images?: Express.Multer.File[]; attachments?: Express.Multer.File[] },
    managementUserId: string
  ): Promise<AnnouncementWithRelations> {
    try {

      const managementUser = await this.prisma.user.findUnique({
        where: { id: managementUserId, role: Role.MANAGEMENT }
      });

      if (!managementUser) {
        throw new Error('Only management users can create announcements');
      }


      if (data.hostelId) {
        const hostel = await this.prisma.hostel.findUnique({
          where: { id: data.hostelId }
        });
        if (!hostel) {
          throw new Error('Specified hostel not found');
        }
      }


      if (data.blockIds && data.blockIds.length > 0) {
        const blocks = await this.prisma.block.findMany({
          where: { id: { in: data.blockIds } }
        });
        if (blocks.length !== data.blockIds.length) {
          throw new Error('One or more specified blocks not found');
        }
      }


      const imageUrls: string[] = [];
      if (files.images && files.images.length > 0) {
        if (files.images.length > config.MAX_IMAGES_PER_ANNOUNCEMENT) {
          throw new Error(`Maximum ${config.MAX_IMAGES_PER_ANNOUNCEMENT} images allowed`);
        }

        for (const image of files.images) {
          const validation = uploadService.validateImage(image);
          if (!validation.valid) {
            throw new Error(validation.error);
          }
          const uploadResult = await uploadService.uploadImage(image);
          imageUrls.push(uploadResult.url);
        }
      }


      const attachmentUrls: string[] = [];
      if (files.attachments && files.attachments.length > 0) {
        if (files.attachments.length > config.MAX_ATTACHMENTS_PER_ANNOUNCEMENT) {
          throw new Error(`Maximum ${config.MAX_ATTACHMENTS_PER_ANNOUNCEMENT} attachments allowed`);
        }

        for (const attachment of files.attachments) {

          const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
          if (!allowedTypes.includes(attachment.mimetype)) {
            throw new Error('Invalid attachment type. Only PDF and Word documents are allowed.');
          }

          if (attachment.size > 10 * 1024 * 1024) {
            throw new Error('Attachment size too large. Maximum size is 10MB.');
          }


          const result = await new Promise<any>((resolve, reject) => {
            const cloudinary = require('../../config/cloudinary').cloudinary;
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'hostel-attachments',
                resource_type: 'raw',
                format: attachment.originalname.split('.').pop(),
              },
              (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(attachment.buffer);
          });

          attachmentUrls.push(result.secure_url);
        }
      }


      const announcement = await this.prisma.announcement.create({
        data: {
          title: data.title,
          content: data.content,
          category: data.category as AnnouncementCategory,
          priority: data.priority,
          images: imageUrls,
          attachments: attachmentUrls,
          hostelId: data.hostelId || null,
          blockIds: data.blockIds || [],
          targetRoles: data.targetRoles || [],
          publishAt: data.publishAt ? new Date(data.publishAt) : new Date(),
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
        include: {
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            }
          }
        }
      });


      const affectedUsersCount = await this.calculateAffectedUsersCount(announcement);


      logger.info({
        message: 'Announcement created successfully',
        announcementId: announcement.id,
        title: announcement.title,
        category: announcement.category,
        priority: announcement.priority,
        affectedUsersCount,
        createdBy: managementUserId,
      });


      await this.invalidateAnnouncementsCache();

      const usersToNotify = await this.prisma.user.findMany({
        where: {},
        select: { id: true, hostelId: true, blockId: true, role: true },
      });

      for (const user of usersToNotify) {
        const now = new Date();
        const canAccess =
          (announcement.hostelId === null || announcement.hostelId === user.hostelId) &&
          (announcement.blockIds.length === 0 || announcement.blockIds.includes(user.blockId || '')) &&
          (announcement.targetRoles.length === 0 || announcement.targetRoles.includes(user.role)) &&
          announcement.publishAt <= now &&
          (announcement.expiresAt === null || announcement.expiresAt > now);

        if (canAccess) {
          await notificationService.createNotification(
            user.id,
            'announcement',
            announcement.title,
            announcement.content.slice(0, 140),
            `/announcements/${announcement.id}`
          );
        }
      }

      if (announcement.hostelId) {
        emitToHostel(announcement.hostelId, 'announcement_created', announcement);
      } else {
        emitToAll('announcement_created', announcement);
      }

      return {
        ...announcement,
        affectedUsersCount,
      } as AnnouncementWithRelations;
    } catch (error) {
      logger.error({
        message: 'Failed to create announcement',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data,
        createdBy: managementUserId,
      });
      throw error;
    }
  }

  async getAnnouncements(
    userId: string,
    userRole: Role,
    filters: GetAnnouncementsInput
  ): Promise<PaginatedAnnouncements> {
    try {
      const { page, limit, category, priority, unreadOnly, startDate, endDate } = filters;
      const skip = (page - 1) * limit;


      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          hostelId: true,
          blockId: true,
          role: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }


      const now = new Date();
      let where: any = {
        publishAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ],
      };

      // Management sees all announcements
      if (userRole !== Role.MANAGEMENT) {
        const hostelFilter = user.hostelId
          ? { OR: [{ hostelId: null }, { hostelId: user.hostelId }] }
          : { OR: [{ hostelId: null }] };

        const blockFilter = user.blockId
          ? { OR: [{ blockIds: { isEmpty: true } }, { blockIds: { has: user.blockId } }] }
          : { OR: [{ blockIds: { isEmpty: true } }] };

        const roleFilter = user.role
          ? { OR: [{ targetRoles: { isEmpty: true } }, { targetRoles: { has: user.role } }] }
          : { OR: [{ targetRoles: { isEmpty: true } }] };

        where.AND = [hostelFilter, blockFilter, roleFilter];
      }


      if (category) {
        where.category = category;
      }

      if (priority !== undefined) {
        where.priority = priority;
      }

      if (startDate) {
        where.publishAt = { ...where.publishAt, gte: new Date(startDate) };
      }

      if (endDate) {
        where.publishAt = { ...where.publishAt, lte: new Date(endDate) };
      }


      const total = await this.prisma.announcement.count({ where });


      const announcements = await this.prisma.announcement.findMany({
        where,
        include: {
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            }
          },
          readBy: {
            where: { userId },
            select: { id: true },
          }
        },
        orderBy: [
          { priority: 'desc' },
          { publishAt: 'desc' }
        ],
        skip,
        take: limit,
      });


      const announcementsWithReadStatus = announcements.map(announcement => ({
        ...announcement,
        isRead: announcement.readBy.length > 0,
        readBy: undefined,
      }));


      const filteredAnnouncements = unreadOnly
        ? announcementsWithReadStatus.filter(a => !a.isRead)
        : announcementsWithReadStatus;


      const unreadCount = await this.prisma.announcement.count({
        where: {
          ...where,
          readBy: {
            none: { userId }
          }
        }
      });


      const totalPages = Math.ceil(total / limit);
      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      return {
        announcements: filteredAnnouncements,
        pagination,
        unreadCount,
      };
    } catch (error) {
      logger.error({
        message: 'Failed to get announcements',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId,
        userRole,
        filters,
      });
      throw error;
    }
  }

  async markAsRead(announcementId: string, userId: string, userRole?: Role): Promise<void> {
    try {

      const announcement = await this.prisma.announcement.findUnique({
        where: { id: announcementId }
      });

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      // Management can mark as read without access check
      if (userRole === Role.MANAGEMENT) {
        await this.prisma.announcementRead.upsert({
          where: {
            announcementId_userId: {
              announcementId,
              userId,
            }
          },
          update: {
            readAt: new Date(),
          },
          create: {
            announcementId,
            userId,
            readAt: new Date(),
          }
        });
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          hostelId: true,
          blockId: true,
          role: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const canAccessHostel = !user.hostelId 
        ? announcement.hostelId === null 
        : announcement.hostelId === null || announcement.hostelId === user.hostelId;
      
      const canAccessBlock = !user.blockId
        ? announcement.blockIds.length === 0
        : announcement.blockIds.length === 0 || announcement.blockIds.includes(user.blockId);
      
      const canAccessRole = !user.role
        ? announcement.targetRoles.length === 0
        : announcement.targetRoles.length === 0 || announcement.targetRoles.includes(user.role);

      const canAccess = canAccessHostel && canAccessBlock && canAccessRole &&
        announcement.publishAt <= now &&
        (announcement.expiresAt === null || announcement.expiresAt > now);

      if (!canAccess) {
        throw new Error('User cannot access this announcement');
      }


      await this.prisma.announcementRead.upsert({
        where: {
          announcementId_userId: {
            announcementId,
            userId,
          }
        },
        update: {
          readAt: new Date(),
        },
        create: {
          announcementId,
          userId,
          readAt: new Date(),
        }
      });


      await this.invalidateUserAnnouncementsCache(userId);
    } catch (error) {
      logger.error({
        message: 'Failed to mark announcement as read',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        announcementId,
        userId,
      });
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          hostelId: true,
          blockId: true,
          role: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }


      const now = new Date();
      const hostelFilter = user.hostelId
        ? { OR: [{ hostelId: null }, { hostelId: user.hostelId }] }
        : { OR: [{ hostelId: null }] };

      const blockFilter = user.blockId
        ? { OR: [{ blockIds: { isEmpty: true } }, { blockIds: { has: user.blockId } }] }
        : { OR: [{ blockIds: { isEmpty: true } }] };

      const roleFilter = user.role
        ? { OR: [{ targetRoles: { isEmpty: true } }, { targetRoles: { has: user.role } }] }
        : { OR: [{ targetRoles: { isEmpty: true } }] };

      const where: any = {
        publishAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ],
        AND: [hostelFilter, blockFilter, roleFilter],
        readBy: {
          none: { userId }
        }
      };

      return await this.prisma.announcement.count({ where });
    } catch (error) {
      logger.error({
        message: 'Failed to get unread count',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId,
      });
      throw error;
    }
  }

  async getAnnouncementById(announcementId: string, userId: string, userRole?: Role): Promise<AnnouncementWithRelations> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          hostelId: true,
          blockId: true,
          role: true,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const announcement = await this.prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            }
          },
          readBy: {
            where: { userId },
            select: { id: true },
          }
        }
      });

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      // Management can access all announcements
      if (userRole === Role.MANAGEMENT) {
        return {
          ...announcement,
          isRead: announcement.readBy.length > 0,
          createdBy: {
            id: announcement.createdById,
            name: 'Admin',
            email: 'admin@hostel.com',
          },
        } as any;
      }

      const now = new Date();
      const canAccessHostel = !user.hostelId 
        ? announcement.hostelId === null 
        : announcement.hostelId === null || announcement.hostelId === user.hostelId;
      
      const canAccessBlock = !user.blockId
        ? announcement.blockIds.length === 0
        : announcement.blockIds.length === 0 || announcement.blockIds.includes(user.blockId);
      
      const canAccessRole = !user.role
        ? announcement.targetRoles.length === 0
        : announcement.targetRoles.length === 0 || announcement.targetRoles.includes(user.role);

      const canAccess = canAccessHostel && canAccessBlock && canAccessRole &&
        announcement.publishAt <= now &&
        (announcement.expiresAt === null || announcement.expiresAt > now);

      if (!canAccess) {
        throw new Error('User cannot access this announcement');
      }

      return {
        ...announcement,
        isRead: announcement.readBy.length > 0,
        readBy: undefined,
      } as AnnouncementWithRelations;
    } catch (error) {
      logger.error({
        message: 'Failed to get announcement by id',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        announcementId,
        userId,
      });
      throw error;
    }
  }

  private async calculateAffectedUsersCount(announcement: Announcement): Promise<number> {
    try {
      const where: any = {};


      if (announcement.hostelId) {
        where.hostelId = announcement.hostelId;
      }


      if (announcement.blockIds.length > 0) {
        where.blockId = { in: announcement.blockIds };
      }


      if (announcement.targetRoles.length > 0) {
        where.role = { in: announcement.targetRoles };
      }

      return await this.prisma.user.count({ where });
    } catch (error) {
      logger.error({
        message: 'Failed to calculate affected users count',
        error,
        announcementId: announcement.id,
      });
      return 0;
    }
  }

  /**
   * Update an announcement
   */
  async updateAnnouncement(
    announcementId: string,
    data: UpdateAnnouncementInput,
    managementUserId: string
  ): Promise<AnnouncementWithRelations> {
    const managementUser = await this.prisma.user.findUnique({
      where: { id: managementUserId, role: Role.MANAGEMENT },
    });

    if (!managementUser) {
      throw new Error('Only management users can update announcements');
    }

    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new Error('Announcement not found');
    }

    if (data.hostelId !== undefined) {
      if (data.hostelId) {
        const hostel = await this.prisma.hostel.findUnique({
          where: { id: data.hostelId },
        });
        if (!hostel) {
          throw new Error('Specified hostel not found');
        }
      }
    }

    if (data.blockIds !== undefined && data.blockIds.length > 0) {
      const blocks = await this.prisma.block.findMany({
        where: { id: { in: data.blockIds } },
      });
      if (blocks.length !== data.blockIds.length) {
        throw new Error('One or more specified blocks not found');
      }
    }

    const updatedAnnouncement = await this.prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        priority: data.priority,
        hostelId: data.hostelId,
        blockIds: data.blockIds,
        targetRoles: data.targetRoles,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
      include: {
        hostel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.invalidateAnnouncementsCache();

    return updatedAnnouncement as AnnouncementWithRelations;
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(
    announcementId: string,
    managementUserId: string
  ): Promise<void> {
    const managementUser = await this.prisma.user.findUnique({
      where: { id: managementUserId, role: Role.MANAGEMENT },
    });

    if (!managementUser) {
      throw new Error('Only management users can delete announcements');
    }

    const announcement = await this.prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      throw new Error('Announcement not found');
    }

    await this.prisma.announcement.delete({
      where: { id: announcementId },
    });

    await this.invalidateAnnouncementsCache();
  }

  private async invalidateAnnouncementsCache(): Promise<void> {
    try {

      await cacheService.del('announcements:*');
    } catch (error) {
      logger.error({
        message: 'Failed to invalidate announcements cache',
        error,
      });
    }
  }

  private async invalidateUserAnnouncementsCache(userId: string): Promise<void> {
    try {

      await cacheService.del(`announcements:user:${userId}:*`);
      await cacheService.del(`announcements:user:${userId}:unread`);
    } catch (error) {
      logger.error({
        message: 'Failed to invalidate user announcements cache',
        error,
        userId,
      });
    }
  }
}

export const announcementService = new AnnouncementService();