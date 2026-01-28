import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import issueRoutes from './modules/issues/issue.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);

export default router;