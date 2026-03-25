import { Router } from 'express';
import { announcementController } from './announcement.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { announcementUpload, handleUploadError } from '../../shared/middleware/upload.middleware';
import { createAnnouncementSchema, getAnnouncementsSchema, updateAnnouncementSchema } from './announcement.validation';
import { Role } from '@prisma/client';

const router = Router();


router.post(
  '/',
  authenticate as any,
  authorize(Role.MANAGEMENT) as any,
  announcementUpload,
  handleUploadError,
  validateRequest(createAnnouncementSchema),
  announcementController.createAnnouncement as any
);


router.get(
  '/',
  authenticate as any,
  validateRequest(getAnnouncementsSchema, 'query' as any),
  announcementController.getAnnouncements as any
);


router.post(
  '/:id/mark-read',
  authenticate as any,
  announcementController.markAsRead as any
);


router.get(
  '/unread-count',
  authenticate as any,
  announcementController.getUnreadCount as any
);

router.get(
  '/:id',
  authenticate as any,
  announcementController.getAnnouncementById as any
);

router.patch(
  '/:id',
  authenticate as any,
  authorize(Role.MANAGEMENT) as any,
  validateRequest(updateAnnouncementSchema),
  announcementController.updateAnnouncement as any
);

router.delete(
  '/:id',
  authenticate as any,
  authorize(Role.MANAGEMENT) as any,
  announcementController.deleteAnnouncement as any
);

export default router;