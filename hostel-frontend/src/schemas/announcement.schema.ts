import { z } from 'zod';

/**
 * Announcement Schemas for Frontend Forms
 */

// Announcement Categories
export const announcementCategoryEnum = z.enum([
    'CLEANING_SCHEDULE',
    'PEST_CONTROL',
    'MAINTENANCE_NOTICE',
    'WATER_ELECTRICITY',
    'GENERAL',
]);

// Role enum for targeting
export const roleEnum = z.enum(['STUDENT', 'STAFF', 'MANAGEMENT']);

// File validation
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_ATTACHMENT_TYPES = ['application/pdf'];

// Create Announcement Schema
export const createAnnouncementSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(150, 'Title must be less than 150 characters'),
    content: z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .max(2000, 'Content must be less than 2000 characters'),
    category: announcementCategoryEnum,
    priority: z.boolean().default(false),
    hostelId: z.string().optional(),
    blockIds: z.array(z.string()).optional(),
    targetRoles: z
        .array(roleEnum)
        .min(1, 'Please select at least one target role'),
    images: z
        .array(
            z
                .instanceof(File)
                .refine((file) => file.size <= MAX_IMAGE_SIZE, 'Each image must be less than 5MB')
                .refine(
                    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
                    'Only .jpg, .jpeg, .png and .webp formats are supported'
                )
        )
        .max(3, 'Maximum 3 images allowed')
        .optional(),
    attachments: z
        .array(
            z
                .instanceof(File)
                .refine((file) => file.size <= MAX_ATTACHMENT_SIZE, 'Each attachment must be less than 10MB')
                .refine(
                    (file) => ACCEPTED_ATTACHMENT_TYPES.includes(file.type),
                    'Only PDF files are supported'
                )
        )
        .max(2, 'Maximum 2 attachments allowed')
        .optional(),
    expiresAt: z.string().optional(), // ISO date string
});

export type CreateAnnouncementFormData = z.infer<typeof createAnnouncementSchema>;
