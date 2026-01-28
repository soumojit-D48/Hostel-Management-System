import cron from 'node-cron';
import { notificationService } from '../modules/notifications/notification.service';
import { logger } from '../shared/services/logger.service';

export const startNotificationArchivalJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await notificationService.archiveOldNotifications(30);
      logger.info({
        message: 'Notification archival job completed',
        data: { deletedCount: result.deletedCount },
      });
    } catch (error) {
      logger.error({
        message: 'Notification archival job failed',
        error: error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error,
      });
    }
  });
};


