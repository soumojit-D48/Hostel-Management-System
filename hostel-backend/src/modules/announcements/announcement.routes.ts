import { Router } from 'express';
import { announcementController } from './announcement.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/authorize.middleware';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { announcementUpload, handleUploadError } from '../../shared/middleware/upload.middleware';
import { createAnnouncementSchema, getAnnouncementsSchema } from './announcement.validation';
import { Role } from '@prisma/client';

const router = Router();

// POST / - Create announcement (Management only)
router.post(
  '/',
  authenticate as any,
  authorize(Role.MANAGEMENT) as any,
  announcementUpload,
  handleUploadError,
  validateRequest(createAnnouncementSchema),
  announcementController.createAnnouncement as any
);

// GET / - Get announcements (All authenticated users)
router.get(
  '/',
  authenticate as any,
  validateRequest(getAnnouncementsSchema, 'query' as any),
  announcementController.getAnnouncements as any
);

// POST /:id/mark-read - Mark announcement as read (All authenticated users)
router.post(
  '/:id/mark-read',
  authenticate as any,
  announcementController.markAsRead as any
);

// GET /unread-count - Get unread count (All authenticated users)
router.get(
  '/unread-count',
  authenticate as any,
  announcementController.getUnreadCount as any
);

export default router;