import { Request, Response, NextFunction } from 'express';
import { issueService } from './issue.service';
import { 
  CreateIssueInput, 
  GetIssuesInput, 
  GetIssueByIdInput, 
  SearchIssuesInput,
  UpdateStatusInput,
  AssignIssueInput
} from './issue.validation';
import { IssueStatus, Role } from '@prisma/client';
import { successResponse, paginatedResponse, createPaginationParams } from '../../shared/utils/responseFormatter';
import { AuthenticatedRequest } from '../../shared/types';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/middleware/error.middleware';

interface IssueQueryData {
  page: number;
  limit: number;
  status?: any;
  category?: any;
  priority?: any;
  visibility?: any;
  hostelId?: string | undefined;
  blockId?: string | undefined;
  search?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  sortBy: string;
  sortOrder: string;
}

class IssueController {
  async createIssue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData: CreateIssueInput = req.body;
      const files = req.files as { images?: Express.Multer.File[]; videos?: Express.Multer.File[] };
      const userId = req.user!.id;

      
      const imageCount = files.images?.length || 0;
      const videoCount = files.videos?.length || 0;

      if (imageCount > 5) {
        res.status(400).json(
          successResponse(null, 'Maximum 5 images allowed per issue')
        );
        return;
      }

      if (videoCount > 1) {
        res.status(400).json(
          successResponse(null, 'Maximum 1 video allowed per issue')
        );
        return;
      }

      const issue = await issueService.createIssue(validatedData, files, userId);

      res.status(201).json(
        successResponse(issue, 'Issue created successfully')
      );
      return;
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json(
          successResponse(null, error.message)
        );
        return;
      }
      return next(error);
    }
  }

  async getIssues(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData: GetIssuesInput = req.query as any;
      const userId = req.user?.id || '';
      const userRole = req.user?.role as any;

      const pagination = createPaginationParams(
        validatedData.page?.toString() || '1',
        validatedData.limit?.toString() || '20'
      );

      
      const queryData: IssueQueryData = {
        page: validatedData.page || 1,
        limit: validatedData.limit || 20,
        status: validatedData.status,
        category: validatedData.category,
        priority: validatedData.priority,
        visibility: validatedData.visibility,
        hostelId: validatedData.hostelId,
        blockId: validatedData.blockId,
        search: validatedData.search,
        dateFrom: validatedData.dateFrom ? new Date(validatedData.dateFrom) : undefined,
        dateTo: validatedData.dateTo ? new Date(validatedData.dateTo) : undefined,
        sortBy: validatedData.sortBy || 'createdAt',
        sortOrder: validatedData.sortOrder || 'desc',
      };

      const { issues, total, totalPages } = await issueService.getIssues(
        userId,
        userRole,
        queryData,
        pagination
      );

      res.status(200).json(
        paginatedResponse(
          issues,
          pagination.page,
          pagination.limit,
          total,
          'Issues retrieved successfully'
        )
      );
      return;
    } catch (error) {
      return next(error);
    }
  }

  async getIssueById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const issueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = req.user?.id || '';
      const userRole = req.user?.role as any;

      const issue = await issueService.getIssueById(issueId || '', userId, userRole);

      res.status(200).json(
        successResponse(issue, 'Issue retrieved successfully')
      );
      return;
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json(
          successResponse(null, error.message)
        );
        return;
      }
      if (error instanceof ForbiddenError) {
        res.status(403).json(
          successResponse(null, error.message)
        );
        return;
      }
      return next(error);
    }
  }

  async searchIssues(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData: SearchIssuesInput = req.query as any;
      const { query, ...filters } = validatedData;
      const userId = req.user?.id || '';
      const userRole = req.user?.role as any;

      const pagination = createPaginationParams(
        validatedData.page?.toString(),
        validatedData.limit?.toString()
      );

      
      const searchFilters: any = {
        ...filters
      };
      
      
      if (filters.dateFrom) {
        searchFilters.dateFrom = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        searchFilters.dateTo = new Date(filters.dateTo);
      }

      const { issues, total, totalPages } = await issueService.searchIssues(
        query!,
        filters,
        userId,
        userRole,
        pagination
      );

      res.status(200).json(
        paginatedResponse(
          issues,
          pagination.page,
          pagination.limit,
          total,
          'Search results retrieved successfully'
        )
      );
      return;
    } catch (error) {
      return next(error);
    }
  }

  async updateIssueStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, remarks } = req.body as UpdateStatusInput;
      const issueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const updatedIssue = await issueService.updateIssueStatus(
        issueId || '',
        status || IssueStatus.REPORTED,
        remarks || undefined,
        userId,
        userRole as any
      );

      res.status(200).json(
        successResponse(
          updatedIssue,
          'Issue status updated successfully'
        )
      );
      return;
    } catch (error) {
      return next(error);
    }
  }

  async assignIssue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignedToId, note, deadline } = req.body as AssignIssueInput;
      const issueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const managementUserId = req.user!.id;

      const updatedIssue = await issueService.assignIssue(
        issueId || '',
        assignedToId || '',
        note || undefined,
        deadline ? new Date(deadline) : undefined,
        managementUserId
      );

      res.status(200).json(
        successResponse(
          updatedIssue,
          'Issue assigned successfully'
        )
      );
      return;
    } catch (error) {
      return next(error);
    }
  }

  async findSimilarIssues(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const issueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userRole = req.user?.role as any;

      
      if (userRole !== Role.MANAGEMENT) {
        res.status(403).json(
          successResponse(null, 'Only management can find similar issues')
        );
        return;
      }

      const similarIssues = await issueService.findSimilarIssues(issueId || '');

      res.status(200).json(
        successResponse(
          similarIssues,
          'Similar issues retrieved successfully'
        )
      );
      return;
    } catch (error) {
      return next(error);
    }
  }

  async mergeIssues(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { duplicateIssueIds } = req.body;
      const issueId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const managementUserId = req.user!.id;

      
      if (!duplicateIssueIds || !Array.isArray(duplicateIssueIds) || duplicateIssueIds.length === 0) {
        res.status(400).json(
          successResponse(null, 'Duplicate issue IDs array is required')
        );
        return;
      }

      const mergedIssue = await issueService.mergeIssues(
        issueId || '',
        duplicateIssueIds,
        managementUserId
      );

      res.status(200).json(
        successResponse(
          mergedIssue,
          `Merged ${duplicateIssueIds.length} issues successfully`
        )
      );
      return;
    } catch (error) {
      return next(error);
    }
  }
}

export const issueController = new IssueController();