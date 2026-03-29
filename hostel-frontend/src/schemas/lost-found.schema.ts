import { z } from 'zod';

/**
 * Lost & Found Schemas for Frontend Forms
 */

// Lost/Found Status
export const lostFoundStatusEnum = z.enum([
    'LOST',
    'FOUND',
    'CLAIMED',
    'RETURNED',
]);

// Lost/Found Categories
export const lostFoundCategoryEnum = z.enum([
    'ELECTRONICS',
    'CLOTHING',
    'DOCUMENTS',
    'KEYS',
    'BOOKS',
    'ACCESSORIES',
    'OTHER',
]);

// File validation
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Create Lost/Found Item Schema
export const createLostFoundSchema = z.object({
    itemName: z
        .string()
        .min(1, 'Item name is required')
        .max(100, 'Item name must be less than 100 characters'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters'),
    category: lostFoundCategoryEnum,
    status: lostFoundStatusEnum,
    location: z
        .string()
        .min(1, 'Location is required')
        .max(200, 'Location must be less than 200 characters'),
    date: z.string().min(1, 'Date is required'), // ISO date string
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
});

export type CreateLostFoundFormData = z.infer<typeof createLostFoundSchema>;

// Claim Item Schema
export const createClaimSchema = z.object({
    verificationDetails: z
        .string()
        .min(20, 'Please provide detailed verification information (min 20 characters)')
        .max(500, 'Verification details must be less than 500 characters'),
    proofImage: z
        .instanceof(File)
        .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, 'Image must be less than 5MB')
        .refine(
            (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
            'Only .jpg, .jpeg, .png and .webp formats are supported'
        )
        .optional(),
});

export type CreateClaimFormData = z.infer<typeof createClaimSchema>;

// Update Claim Status Schema
export const updateClaimSchema = z.object({
    action: z.enum(['APPROVE', 'REJECT']),
    remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
});

export type UpdateClaimFormData = z.infer<typeof updateClaimSchema>;

// Search Lost/Found Schema
export const searchLostFoundSchema = z.object({
    query: z.string().min(3, 'Search query must be at least 3 characters'),
    category: lostFoundCategoryEnum.optional(),
    status: lostFoundStatusEnum.optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
});

export type SearchLostFoundFormData = z.infer<typeof searchLostFoundSchema>;
