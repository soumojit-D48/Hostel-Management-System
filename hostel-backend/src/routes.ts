import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import issueRoutes from './modules/issues/issue.routes';
import announcementRoutes from './modules/announcements/announcement.routes';
import commentRoutes from './modules/comments/comment.routes';
import reactionRoutes from './modules/reactions/reaction.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/announcements', announcementRoutes);
router.use('/comments', commentRoutes);
router.use('/reactions', reactionRoutes);

export default router;