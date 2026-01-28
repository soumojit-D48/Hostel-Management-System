import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { notificationController } from './notification.controller';

const router = Router();

router.use(authenticate as any);

router.get('/', notificationController.getNotifications as any);

router.patch('/:id/read', notificationController.markAsRead as any);

router.patch('/mark-all-read', notificationController.markAllAsRead as any);

router.get('/unread-count', notificationController.getUnreadCount as any);

export default router;


