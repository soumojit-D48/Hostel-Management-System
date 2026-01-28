import { Router } from 'express';
import lostFoundController from './lost-found.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';
import { Role } from '@prisma/client';

const router = Router();


router.use(authenticate as any);

router.post(
    '/',
    
    lostFoundController.createLostFoundItem as any
);

router.get(
    '/',
    lostFoundController.getLostFoundItems as any
);

router.get(
    '/search',
    lostFoundController.searchLostFoundItems as any
);

router.get(
    '/claims/pending',
    authorize(Role.MANAGEMENT) as any,
    lostFoundController.getPendingClaims as any
);

router.get(
    '/:id',
    lostFoundController.getLostFoundItemById as any
);

router.post(
    '/:id/claim',
    lostFoundController.claimItem as any
);

router.patch(
    '/claims/:id',
    authorize(Role.MANAGEMENT) as any,
    lostFoundController.updateClaimStatus as any
);

router.patch(
    '/:id/returned',
    authorize(Role.MANAGEMENT) as any,
    lostFoundController.markAsReturned as any
);

export default router;
