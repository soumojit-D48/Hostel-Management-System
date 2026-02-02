import { z } from 'zod';

export const getStaffListSchema = z.object({
    hostelId: z.string().optional(),
    available: z.string().transform(val => val === 'true').optional(),
});

export type GetStaffListQuery = z.infer<typeof getStaffListSchema>;
