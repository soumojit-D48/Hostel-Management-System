import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  rollNumber: z.string().max(20, 'Roll number must be less than 20 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  emergencyContact: z.string().regex(/^\d{10}$/, 'Emergency contact must be exactly 10 digits'),
  hostelId: z.string().min(1, 'Hostel is required'),
  blockId: z.string().min(1, 'Block is required'),
  roomNumber: z.string().max(10, 'Room number must be less than 10 characters'),
  bloodGroup: z.string().optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().uuid('Invalid verification token format'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;