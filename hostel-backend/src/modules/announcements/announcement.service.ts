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
      // Validate management user
      const managementUser = await this.prisma.user.findUnique({
        where: { id: managementUserId, role: Role.MANAGEMENT }
      });

      if (!managementUser) {
        throw new Error('Only management users can create announcements');
      }

      // Validate hostel if specified
      if (data.hostelId) {
        const hostel = await this.prisma.hostel.findUnique({
          where: { id: data.hostelId }
        });
        if (!hostel) {
          throw new Error('Specified hostel not found');
        }
      }

      // Validate blocks if specified
      if (data.blockIds && data.blockIds.length > 0) {
        const blocks = await this.prisma.block.findMany({
          where: { id: { in: data.blockIds } }
        });
        if (blocks.length !== data.blockIds.length) {
          throw new Error('One or more specified blocks not found');
        }
      }

      // Process uploaded images
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

      // Process uploaded attachments (PDFs, documents)
      const attachmentUrls: string[] = [];
      if (files.attachments && files.attachments.length > 0) {
        if (files.attachments.length > config.MAX_ATTACHMENTS_PER_ANNOUNCEMENT) {
          throw new Error(`Maximum ${config.MAX_ATTACHMENTS_PER_ANNOUNCEMENT} attachments allowed`);
        }

        for (const attachment of files.attachments) {
          // Validate attachment type (PDF, DOC, etc.)
          const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
          if (!allowedTypes.includes(attachment.mimetype)) {
            throw new Error('Invalid attachment type. Only PDF and Word documents are allowed.');
          }

          if (attachment.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Attachment size too large. Maximum size is 10MB.');
          }

          // Upload attachment to Cloudinary
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

      // Create announcement
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

      // Calculate affected users count
      const affectedUsersCount = await this.calculateAffectedUsersCount(announcement);

      // Log announcement creation
      logger.info({
        message: 'Announcement created successfully',
        announcementId: announcement.id,
        title: announcement.title,
        category: announcement.category,
        priority: announcement.priority,
        affectedUsersCount,
        createdBy: managementUserId,
      });

      // Invalidate cache for announcements
      await this.invalidateAnnouncementsCache();

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

      // Get user details for targeting
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

      // Build where clause for targeting
      const now = new Date();
      const where: any = {
        publishAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ],
        AND: [
          // Targeting logic
          {
            OR: [
              { hostelId: null }, // All hostels
              { hostelId: user.hostelId }, // User's hostel
            ]
          },
          {
            OR: [
              { blockIds: { isEmpty: true } }, // All blocks
              { blockIds: { has: user.blockId } }, // User's block
            ]
          },
          {
            OR: [
              { targetRoles: { isEmpty: true } }, // All roles
              { targetRoles: { has: user.role } }, // User's role
            ]
          }
        ]
      };

      // Apply filters
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

      // Get total count
      const total = await this.prisma.announcement.count({ where });

      // Get announcements with read status
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

      // Mark read status
      const announcementsWithReadStatus = announcements.map(announcement => ({
        ...announcement,
        isRead: announcement.readBy.length > 0,
        readBy: undefined, // Remove readBy from response
      }));

      // Filter by unread status if requested
      const filteredAnnouncements = unreadOnly
        ? announcementsWithReadStatus.filter(a => !a.isRead)
        : announcementsWithReadStatus;

      // Get unread count
      const unreadCount = await this.prisma.announcement.count({
        where: {
          ...where,
          readBy: {
            none: { userId }
          }
        }
      });

      // Calculate pagination
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

  async markAsRead(announcementId: string, userId: string): Promise<void> {
    try {
      // Verify announcement exists and user can access it
      const announcement = await this.prisma.announcement.findUnique({
        where: { id: announcementId }
      });

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      // Check if user can access this announcement (same targeting logic as getAnnouncements)
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
      const canAccess = 
        (announcement.hostelId === null || announcement.hostelId === user.hostelId) &&
        (announcement.blockIds.length === 0 || announcement.blockIds.includes(user.blockId)) &&
        (announcement.targetRoles.length === 0 || announcement.targetRoles.includes(user.role)) &&
        announcement.publishAt <= now &&
        (announcement.expiresAt === null || announcement.expiresAt > now);

      if (!canAccess) {
        throw new Error('User cannot access this announcement');
      }

      // Create or update read record
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

      // Invalidate cache for this user's announcements
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
      // Get user details for targeting
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

      // Build where clause for targeting
      const now = new Date();
      const where: any = {
        publishAt: { lte: now },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ],
        AND: [
          {
            OR: [
              { hostelId: null },
              { hostelId: user.hostelId },
            ]
          },
          {
            OR: [
              { blockIds: { isEmpty: true } },
              { blockIds: { has: user.blockId } },
            ]
          },
          {
            OR: [
              { targetRoles: { isEmpty: true } },
              { targetRoles: { has: user.role } },
            ]
          }
        ],
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

  private async calculateAffectedUsersCount(announcement: Announcement): Promise<number> {
    try {
      const where: any = {};

      // Hostel targeting
      if (announcement.hostelId) {
        where.hostelId = announcement.hostelId;
      }

      // Block targeting
      if (announcement.blockIds.length > 0) {
        where.blockId = { in: announcement.blockIds };
      }

      // Role targeting
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

  private async invalidateAnnouncementsCache(): Promise<void> {
    try {
      // Invalidate general announcements cache
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
      // Invalidate user-specific announcements cache
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