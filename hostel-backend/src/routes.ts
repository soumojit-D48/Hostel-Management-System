import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import issueRoutes from './modules/issues/issue.routes';
import announcementRoutes from './modules/announcements/announcement.routes';
import commentRoutes from './modules/comments/comment.routes';
import reactionRoutes from './modules/reactions/reaction.routes';
import lostFoundRoutes from './modules/lost-found/lost-found.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import hostelRoutes from './modules/hostels/hostel.routes';
import userRoutes from './modules/users/user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/announcements', announcementRoutes);
router.use('/comments', commentRoutes);
router.use('/reactions', reactionRoutes);
router.use('/lost-found', lostFoundRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/hostels', hostelRoutes);
router.use('/users', userRoutes);

export default router;