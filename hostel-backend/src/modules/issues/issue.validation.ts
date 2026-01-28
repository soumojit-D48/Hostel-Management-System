import { z } from 'zod';
import { IssueStatus, IssuePriority, IssueCategory, IssueVisibility } from '@prisma/client';

export const createIssueSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  category: z.nativeEnum(IssueCategory, {
    message: 'Invalid category',
  }),
  priority: z.nativeEnum(IssuePriority, {
    message: 'Invalid priority',
  }),
  visibility: z.nativeEnum(IssueVisibility, {
    message: 'Invalid visibility',
  }).default(IssueVisibility.PUBLIC),
});

export const getIssuesSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 20),
  status: z.nativeEnum(IssueStatus).optional(),
  category: z.nativeEnum(IssueCategory).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  visibility: z.nativeEnum(IssueVisibility).optional(),
  hostelId: z.string().optional(),
  blockId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const getIssueByIdSchema = z.object({
  id: z.string().min(1, 'Issue ID is required'),
});

export const searchIssuesSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 50) : 20),
  category: z.nativeEnum(IssueCategory).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  hostelId: z.string().optional(),
  blockId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(IssueStatus, {
    message: 'Invalid status',
  }),
  remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
});

export const assignIssueSchema = z.object({
  assignedToId: z.string().min(1, 'Staff ID is required'),
  note: z.string().max(500, 'Note must be less than 500 characters').optional(),
  deadline: z.string().datetime().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type GetIssuesInput = z.infer<typeof getIssuesSchema>;
export type GetIssueByIdInput = z.infer<typeof getIssueByIdSchema>;
export type SearchIssuesInput = z.infer<typeof searchIssuesSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignIssueInput = z.infer<typeof assignIssueSchema>;