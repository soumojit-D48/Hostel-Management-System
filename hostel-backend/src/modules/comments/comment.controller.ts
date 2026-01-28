import { Request, Response } from 'express';
import { commentService } from './comment.service';
import { CreateCommentInput, UpdateCommentInput, GetCommentsInput } from './comment.validation';
import { AuthenticatedRequest } from '../../shared/types';
import { logger } from '../../shared/services/logger.service';
import { Role } from '@prisma/client';

class CommentController {
  async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      // Validate request body
      const validatedData: CreateCommentInput = req.body as CreateCommentInput;

      // Create comment
      const comment = await commentService.createComment(
        validatedData,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment created successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Create comment controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        body: req.body,
      });

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('Not authorized') || error.message.includes('permission')) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('Parent comment') || error.message.includes('reply to a reply')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create comment',
        },
      });
    }
  }

  async getComments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      // Validate query parameters
      const validatedQuery: GetCommentsInput = req.query as any;
      const { issueId, announcementId } = validatedQuery;

      // Determine resource type and ID
      const resourceId = issueId || announcementId;
      const resourceType = issueId ? 'issue' : 'announcement';

      if (!resourceId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Either issueId or announcementId must be provided',
          },
        });
        return;
      }

      // Extract pagination
      const { page, limit } = validatedQuery;

      // Get comments
      const result = await commentService.getComments(
        resourceId,
        resourceType,
        { page, limit }
      );

      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
        message: 'Comments retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get comments controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        query: req.query,
      });

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
        return;
      }

      if (error instanceof Error && error.message.includes('Not authorized')) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get comments',
        },
      });
    }
  }

  async updateComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

const commentId = req.params.id as string;
      
      // Validate request body
      const validatedData: UpdateCommentInput = req.body as UpdateCommentInput;
      
      // Update comment
      const comment = await commentService.updateComment(
        commentId,
        validatedData.content,
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: comment,
        message: 'Comment updated successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Update comment controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        commentId: req.params.id,
        body: req.body,
      });

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('Not authorized')) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('5 minutes')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'EDIT_WINDOW_EXPIRED',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update comment',
        },
      });
    }
  }

  async deleteComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

const commentId = req.params.id as string;
      
      // Delete comment
      await commentService.deleteComment(commentId, req.user.id);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Delete comment controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        commentId: req.params.id,
      });

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('Not authorized')) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete comment',
        },
      });
    }
  }

  async getCommentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

const commentId = req.params.id as string;
      
      // Get comment
      const comment = await commentService.getCommentById(
        commentId,
        req.user.id
      );

      if (!comment) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Comment not found',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: comment,
        message: 'Comment retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get comment by ID controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        commentId: req.params.id,
      });

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('Not authorized')) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get comment',
        },
      });
    }
  }
}

export const commentController = new CommentController();