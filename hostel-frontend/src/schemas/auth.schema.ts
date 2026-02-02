import { z } from 'zod';

/**
 * Authentication Schemas for Frontend Forms
 * These schemas provide user-friendly validation messages
 */

// Register Schema
export const registerSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name is too long'),
    rollNumber: z
        .string()
        .min(1, 'Roll number is required')
        .max(50, 'Roll number is too long'),
    phone: z
        .string()
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    emergencyContact: z
        .string()
        .regex(/^\d{10}$/, 'Emergency contact must be exactly 10 digits'),
    hostelId: z.string().min(1, 'Please select a hostel'),
    blockId: z.string().min(1, 'Please select a block'),
    roomNumber: z
        .string()
        .min(1, 'Room number is required')
        .max(10, 'Room number is too long'),
    bloodGroup: z.string().optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Login Schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
