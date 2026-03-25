import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title must be less than 150 characters'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  category: z.enum(['CLEANING_SCHEDULE', 'PEST_CONTROL', 'MAINTENANCE_NOTICE', 'WATER_ELECTRICITY', 'GENERAL']),
  priority: z.boolean().default(false),
  hostelId: z.string().optional(),
  blockIds: z.array(z.string()).optional(),
  targetRoles: z.array(z.enum(['STUDENT', 'STAFF', 'MANAGEMENT'])).optional(),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
}).refine((data) => {
  if (data.publishAt && data.expiresAt) {
    return new Date(data.expiresAt) > new Date(data.publishAt);
  }
  return true;
}, {
  message: 'Expiry date must be after publish date',
  path: ['expiresAt']
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150, 'Title must be less than 150 characters').optional(),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters').optional(),
  category: z.enum(['CLEANING_SCHEDULE', 'PEST_CONTROL', 'MAINTENANCE_NOTICE', 'WATER_ELECTRICITY', 'GENERAL']).optional(),
  priority: z.boolean().optional(),
  hostelId: z.string().nullable().optional(),
  blockIds: z.array(z.string()).optional(),
  targetRoles: z.array(z.enum(['STUDENT', 'STAFF', 'MANAGEMENT'])).optional(),
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
}).refine((data) => {
  if (data.publishAt && data.expiresAt) {
    return new Date(data.expiresAt) > new Date(data.publishAt);
  }
  return true;
}, {
  message: 'Expiry date must be after publish date',
  path: ['expiresAt']
});

export const getAnnouncementsSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(10),
  category: z.enum(['CLEANING_SCHEDULE', 'PEST_CONTROL', 'MAINTENANCE_NOTICE', 'WATER_ELECTRICITY', 'GENERAL']).optional(),
  priority: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  unreadOnly: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const markAsReadSchema = z.object({
  announcementId: z.string().min(1, 'Announcement ID is required'),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type GetAnnouncementsInput = z.infer<typeof getAnnouncementsSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;