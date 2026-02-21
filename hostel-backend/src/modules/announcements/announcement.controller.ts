import { Request, Response } from 'express';
import { announcementService } from './announcement.service';
import { CreateAnnouncementInput, GetAnnouncementsInput, MarkAsReadInput } from './announcement.validation';
import { AuthenticatedRequest } from '../../shared/types';
import { logger } from '../../shared/services/logger.service';
import { Role } from '@prisma/client';

class AnnouncementController {
  async createAnnouncement(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {

      if (!req.user || req.user.role !== 'MANAGEMENT') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only management users can create announcements',
          },
        });
        return;
      }


      const validatedData: CreateAnnouncementInput = req.body as CreateAnnouncementInput;


      const files = {
        images: Array.isArray(req.files) ? undefined : req.files?.images as Express.Multer.File[] | undefined,
        attachments: Array.isArray(req.files) ? undefined : req.files?.attachments as Express.Multer.File[] | undefined,
      };


      const announcement = await announcementService.createAnnouncement(
        validatedData,
        files,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: announcement,
        message: 'Announcement created successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Create announcement controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        body: req.body,
      });

      if (error instanceof Error) {
        if (error.message.includes('Only management users can create announcements')) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('Maximum') || error.message.includes('Invalid') || error.message.includes('size too large')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create announcement',
        },
      });
    }
  }

  async getAnnouncements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }


      const filters: GetAnnouncementsInput = req.query as any;


      const result = await announcementService.getAnnouncements(
        req.user.id,
        req.user.role as Role,
        filters
      );

      res.status(200).json({
        success: true,
        data: result.announcements,
        pagination: result.pagination,
        unreadCount: result.unreadCount,
        message: 'Announcements retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get announcements controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        query: req.query,
      });

      if (error instanceof Error && error.message.includes('User not found')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get announcements',
        },
      });
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const announcementId = req.params.id as string;


      await announcementService.markAsRead(announcementId, req.user.id);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Announcement marked as read',
      });
    } catch (error) {
      logger.error({
        message: 'Mark announcement as read controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        announcementId: req.params.id,
      });

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('cannot access')) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark announcement as read',
        },
      });
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }


      const unreadCount = await announcementService.getUnreadCount(req.user.id);

      res.status(200).json({
        success: true,
        data: { unreadCount },
        message: 'Unread count retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get unread count controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
      });

      if (error instanceof Error && error.message.includes('User not found')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get unread count',
        },
      });
    }
  }

  async getAnnouncementById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const announcementId = req.params.id;
      const announcement = await announcementService.getAnnouncementById(announcementId as string, req.user.id);

      res.status(200).json({
        success: true,
        data: announcement,
        message: 'Announcement retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get announcement by id controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        announcementId: req.params.id,
      });

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('cannot access')) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get announcement',
        },
      });
    }
  }
}

export const announcementController = new AnnouncementController();