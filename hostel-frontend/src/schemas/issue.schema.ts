import { z } from 'zod';

/**
 * Issue Schemas for Frontend Forms
 * Includes file validation for image/video uploads
 */

// Issue Categories
export const issueCategoryEnum = z.enum([
    'PLUMBING',
    'ELECTRICAL',
    'CLEANLINESS',
    'INTERNET',
    'FURNITURE',
    'SECURITY',
    'NOISE',
    'OTHER',
]);

// Issue Priorities
export const issuePriorityEnum = z.enum([
    'LOW',
    'MEDIUM',
    'HIGH',
    'EMERGENCY',
]);

// Issue Visibility
export const issueVisibilityEnum = z.enum(['PUBLIC', 'PRIVATE']);

// Issue Status
export const issueStatusEnum = z.enum([
    'REPORTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
]);

// File validation helpers
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

// Create Issue Schema
export const createIssueSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title must be less than 100 characters'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be less than 1000 characters'),
    category: issueCategoryEnum,
    priority: issuePriorityEnum,
    visibility: issueVisibilityEnum,
    location: z.string().max(200, 'Location is too long').optional(),
    roomNumber: z.string().max(10, 'Room number is too long').optional(),
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
        .max(5, 'Maximum 5 images allowed')
        .optional(),
    videos: z
        .array(
            z
                .instanceof(File)
                .refine((file) => file.size <= MAX_VIDEO_SIZE, 'Video must be less than 50MB')
                .refine(
                    (file) => ACCEPTED_VIDEO_TYPES.includes(file.type),
                    'Only .mp4 and .webm formats are supported'
                )
        )
        .max(1, 'Maximum 1 video allowed')
        .optional(),
});

export type CreateIssueFormData = z.infer<typeof createIssueSchema>;

// Update Issue Status Schema
export const updateIssueStatusSchema = z.object({
    status: issueStatusEnum,
    remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
});

export type UpdateIssueStatusFormData = z.infer<typeof updateIssueStatusSchema>;

// Assign Issue Schema
export const assignIssueSchema = z.object({
    assignedToId: z.string().min(1, 'Please select a staff member'),
    note: z.string().max(500, 'Note must be less than 500 characters').optional(),
    deadline: z.string().optional(), // ISO date string
});

export type AssignIssueFormData = z.infer<typeof assignIssueSchema>;

// Search Issues Schema
export const searchIssuesSchema = z.object({
    query: z.string().min(3, 'Search query must be at least 3 characters'),
    category: issueCategoryEnum.optional(),
    status: issueStatusEnum.optional(),
    priority: issuePriorityEnum.optional(),
});

export type SearchIssuesFormData = z.infer<typeof searchIssuesSchema>;

// Merge Issues Schema
export const mergeIssuesSchema = z.object({
    duplicateIssueIds: z
        .array(z.string())
        .min(1, 'Please select at least one duplicate issue'),
});

export type MergeIssuesFormData = z.infer<typeof mergeIssuesSchema>;
