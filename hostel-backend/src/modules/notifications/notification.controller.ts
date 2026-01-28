import { Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { AuthenticatedRequest } from '../../shared/types';

export class NotificationController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { unreadOnly, type, page, limit } = req.query;
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 20;
      const unreadFlag =
        typeof unreadOnly === 'string'
          ? unreadOnly.toLowerCase() === 'true'
          : false;

      const result = await notificationService.getNotifications(
        userId,
        unreadFlag,
        type as string | undefined,
        pageNum,
        limitNum
      );

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const updated = await notificationService.markAsRead(id as string, userId);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Notification not found') {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();


