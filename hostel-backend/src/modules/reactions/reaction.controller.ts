import { Request, Response } from 'express';
import { reactionService } from './reaction.service';
import { ReactionInput, GetReactionCountsInput } from '../comments/comment.validation';
import { AuthenticatedRequest } from '../../shared/types';
import { logger } from '../../shared/services/logger.service';
import { Role } from '@prisma/client';

class ReactionController {
  async addReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      
      const validatedData: ReactionInput = req.body as ReactionInput;

      
      const result = await reactionService.addReaction(
        validatedData,
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.reacted ? 'Reaction added successfully' : 'Reaction removed successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Add reaction controller error',
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
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add/remove reaction',
        },
      });
    }
  }

  async getReactionCounts(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      
      const validatedQuery: GetReactionCountsInput = req.query as any;
      const { issueId, announcementId } = validatedQuery;

      
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

      
      const counts = await reactionService.getReactionCounts(
        resourceId,
        resourceType
      );

      res.status(200).json({
        success: true,
        data: { counts, resourceId, resourceType },
        message: 'Reaction counts retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get reaction counts controller error',
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

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get reaction counts',
        },
      });
    }
  }

  async getUserReactions(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { issueId, announcementId } = req.query;

      
      const resourceId = (issueId as string) || (announcementId as string);
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

      
      const userReactions = await reactionService.getUserReactions(
        resourceId,
        resourceType,
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: { reactions: userReactions, resourceId, resourceType },
        message: 'User reactions retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get user reactions controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        query: req.query,
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
          message: 'Failed to get user reactions',
        },
      });
    }
  }

  async getReactionsByResource(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { issueId, announcementId, page, limit } = req.query;

      
      const resourceId = (issueId as string) || (announcementId as string);
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

      
      const pagination = page && limit ? {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      } : undefined;

      
      const result = await reactionService.getReactionsByResource(
        resourceId,
        resourceType,
        pagination
      );

      res.status(200).json({
        success: true,
        data: {
          reactions: result.reactions,
          counts: result.counts,
          ...(result.pagination ? { pagination: result.pagination } : {})
        },
        message: 'Reactions retrieved successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Get reactions by resource controller error',
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

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get reactions',
        },
      });
    }
  }

  async removeReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
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

const reactionId = req.params.id as string;
      
      
      await reactionService.removeReaction(reactionId, req.user.id);

      res.status(200).json({
        success: true,
        data: null,
        message: 'Reaction removed successfully',
      });
    } catch (error) {
      logger.error({
        message: 'Remove reaction controller error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        userId: req.user?.id,
        reactionId: req.params.id,
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
          message: 'Failed to remove reaction',
        },
      });
    }
  }
}

export const reactionController = new ReactionController();