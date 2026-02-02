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
    issueId: z.string().optional(),
    announcementId: z.string().optional(),
    parentId: z.string().optional(), // For nested replies
}).refine(
    (data) => data.issueId || data.announcementId,
    {
        message: 'Comment must be associated with either an issue or announcement',
    }
);

export type CreateCommentFormData = z.infer<typeof createCommentSchema>;

// Update Comment Schema
export const updateCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment must be less than 500 characters'),
});

export type UpdateCommentFormData = z.infer<typeof updateCommentSchema>;
