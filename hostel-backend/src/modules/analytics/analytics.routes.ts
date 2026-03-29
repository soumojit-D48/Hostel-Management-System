import { Router } from 'express';
import analyticsController from './analytics.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate as any);

router.get(
    '/dashboard',
    analyticsController.getDashboardOverview as any
);

router.get(
    '/categories',
    analyticsController.getCategoryBreakdown as any
);

router.get(
    '/hostels',
    analyticsController.getHostelComparison as any
);

router.get(
    '/trends',
    analyticsController.getIssueTrends as any
);

router.get(
    '/rooms',
    analyticsController.getTopRooms as any
);

router.get(
    '/peak-hours',
    analyticsController.getPeakReportingHours as any
);

router.get(
    '/staff-performance',
    analyticsController.getStaffPerformance as any
);

export default router;
