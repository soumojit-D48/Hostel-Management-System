import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { getStaffListSchema } from './user.validation';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

/**
 * GET /api/users/staff
 * Get list of staff members for assignment
 * Query params: hostelId (optional), available (optional)
 * Access: MANAGEMENT only
 */
router.get(
    '/staff',
    authorize(Role.MANAGEMENT) as any,
    validateRequest(getStaffListSchema, 'query' as any),
    userController.getStaffList as any
);

export default router;
