import { z } from 'zod';

/**
 * Comment Schemas for Frontend Forms
 */

// Create Comment Schema
export const createCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment must be less than 500 characters'),
});

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;

// Update Comment Schema
export const updateCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment must be less than 500 characters'),
});

export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;
