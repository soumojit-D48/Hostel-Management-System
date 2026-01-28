import { z } from 'zod';

export const createCommentSchema = z.object({
  issueId: z.string().optional(),
  announcementId: z.string().optional(),
  content: z.string().min(1, 'Content is required').max(500, 'Content must be less than 500 characters'),
  parentId: z.string().optional(),
}).refine((data) => {
  
  const hasIssueId = !!data.issueId;
  const hasAnnouncementId = !!data.announcementId;
  
  if (!hasIssueId && !hasAnnouncementId) {
    return false;
  }
  if (hasIssueId && hasAnnouncementId) {
    return false;
  }
  
  return true;
}, {
  message: 'Either issueId or announcementId must be provided (not both)',
  path: ['issueId', 'announcementId']
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(500, 'Content must be less than 500 characters'),
});

export const getCommentsSchema = z.object({
  issueId: z.string().optional(),
  announcementId: z.string().optional(),
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(10),
}).refine((data) => {
  
  const hasIssueId = !!data.issueId;
  const hasAnnouncementId = !!data.announcementId;
  
  if (!hasIssueId && !hasAnnouncementId) {
    return false;
  }
  if (hasIssueId && hasAnnouncementId) {
    return false;
  }
  
  return true;
}, {
  message: 'Either issueId or announcementId must be provided (not both)',
  path: ['issueId', 'announcementId']
});

export const reactionSchema = z.object({
  issueId: z.string().optional(),
  announcementId: z.string().optional(),
  type: z.enum(['helpful', 'urgent', 'resolved', 'watching']),
}).refine((data) => {
  
  const hasIssueId = !!data.issueId;
  const hasAnnouncementId = !!data.announcementId;
  
  if (!hasIssueId && !hasAnnouncementId) {
    return false;
  }
  if (hasIssueId && hasAnnouncementId) {
    return false;
  }
  
  return true;
}, {
  message: 'Either issueId or announcementId must be provided (not both)',
  path: ['issueId', 'announcementId']
});

export const getReactionCountsSchema = z.object({
  issueId: z.string().optional(),
  announcementId: z.string().optional(),
}).refine((data) => {
  
  const hasIssueId = !!data.issueId;
  const hasAnnouncementId = !!data.announcementId;
  
  if (!hasIssueId && !hasAnnouncementId) {
    return false;
  }
  if (hasIssueId && hasAnnouncementId) {
    return false;
  }
  
  return true;
}, {
  message: 'Either issueId or announcementId must be provided (not both)',
  path: ['issueId', 'announcementId']
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type GetCommentsInput = z.infer<typeof getCommentsSchema>;
export type ReactionInput = z.infer<typeof reactionSchema>;
export type GetReactionCountsInput = z.infer<typeof getReactionCountsSchema>;