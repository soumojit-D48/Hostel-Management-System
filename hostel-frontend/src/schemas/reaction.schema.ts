import { z } from 'zod';

/**
 * Reaction Schemas for Frontend
 */

// Reaction Types
export const reactionTypeEnum = z.enum([
    'HELPFUL',
    'URGENT',
    'RESOLVED',
    'WATCHING',
    'LIKE',
    'LOVE',
    'SUPPORT',
]);

// Toggle Reaction Schema
export const toggleReactionSchema = z.object({
    type: reactionTypeEnum,
    issueId: z.string().optional(),
    announcementId: z.string().optional(),
}).refine(
    (data) => data.issueId || data.announcementId,
    {
        message: 'Reaction must be associated with either an issue or announcement',
    }
);

export type ToggleReactionFormData = z.infer<typeof toggleReactionSchema>;
