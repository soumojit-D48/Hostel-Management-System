import { z } from 'zod';
import { Role } from '@prisma/client';


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
  role: z.nativeEnum(Role).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32, 'Invalid verification token').max(32, 'Invalid verification token'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, 'Invalid reset token').max(32, 'Invalid reset token'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;