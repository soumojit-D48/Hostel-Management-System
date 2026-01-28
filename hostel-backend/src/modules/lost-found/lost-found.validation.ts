import { z } from 'zod';
import { LostFoundStatus, ClaimStatus } from '@prisma/client';

export const createLostFoundSchema = z.object({
    itemName: z
        .string()
        .min(2, 'Item name must be at least 2 characters')
        .max(100, 'Item name must not exceed 100 characters')
        .trim(),

    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must not exceed 1000 characters')
        .trim(),

    category: z
        .string()
        .min(2, 'Category is required')
        .max(50, 'Category must not exceed 50 characters'),

    location: z
        .string()
        .min(2, 'Location must be at least 2 characters')
        .max(200, 'Location must not exceed 200 characters')
        .trim(),

    date: z
        .string()
        .datetime({ message: 'Invalid date format' })
        .or(z.date())
        .transform((val) => (typeof val === 'string' ? new Date(val) : val)),

    status: z.nativeEnum(LostFoundStatus),

    contactPreference: z
        .enum(['email', 'phone', 'both'])
        .optional()
        .default('both'),
});

export const createClaimSchema = z.object({
    itemId: z.string().cuid('Invalid item ID format'),

    verificationDetails: z
        .string()
        .min(20, 'Verification details must be at least 20 characters')
        .max(1000, 'Verification details must not exceed 1000 characters')
        .trim(),

    proofImage: z.string().url('Invalid proof image URL').optional(),
});

export const updateClaimSchema = z.object({
    action: z.enum(['APPROVE', 'REJECT']),

    remarks: z
        .string()
        .max(500, 'Remarks must not exceed 500 characters')
        .trim()
        .optional(),
});

export const getLostFoundItemsSchema = z.object({
    status: z.nativeEnum(LostFoundStatus).optional(),
    category: z.string().optional(),
    startDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
        .string()
        .datetime()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined)),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
});

export const searchLostFoundSchema = z.object({
    query: z
        .string()
        .min(2, 'Search query must be at least 2 characters')
        .max(100, 'Search query must not exceed 100 characters')
        .trim(),
    status: z.nativeEnum(LostFoundStatus).optional(),
    category: z.string().optional(),
});

export const markAsReturnedSchema = z.object({
    itemId: z.string().cuid('Invalid item ID format'),
});

export type CreateLostFoundInput = z.infer<typeof createLostFoundSchema>;
export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type GetLostFoundItemsInput = z.infer<typeof getLostFoundItemsSchema>;
export type SearchLostFoundInput = z.infer<typeof searchLostFoundSchema>;
