import { z } from 'zod';

export const getStaffListSchema = z.object({
    hostelId: z.string().optional(),
    available: z.string().transform(val => val === 'true').optional(),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
    phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must be less than 15 digits').optional(),
    emergencyContact: z.string().min(10, 'Emergency contact must be at least 10 digits').max(15, 'Emergency contact must be less than 15 digits').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
});

export type GetStaffListQuery = z.infer<typeof getStaffListSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
