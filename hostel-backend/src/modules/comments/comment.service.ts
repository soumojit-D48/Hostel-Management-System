import { prisma } from '../../config/database';
import { 
  Comment, 
  Issue, 
  Announcement, 
  IssueVisibility,
  Role,
  User 
} from '@prisma/client';
import { logger } from '../../shared/services/logger.service';
import { CreateCommentInput, UpdateCommentInput, GetCommentsInput } from './comment.validation';

interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    role: Role;
  };
  replies?: CommentWithUser[];
  _count?: {
    replies: number;
  };
}

interface PaginatedComments {
  comments: CommentWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class CommentService {
  async createComment(
    data: CreateCommentInput,
    userId: string
  ): Promise<CommentWithUser> {
    try {
      const { issueId, announcementId, content, parentId } = data;

      
      if (issueId) {
        const issue = await prisma.issue.findUnique({
          where: { id: issueId },
          include: {
            reportedBy: {
              select: { id: true, role: true }
            }
          }
        });

        if (!issue) {
          throw new Error('Issue not found');
        }

        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true }
        });

        if (!user) {
          throw new Error('User not found');
        }

        
        const canComment = 
          issue.visibility === IssueVisibility.PUBLIC ||
          issue.reportedBy.id === userId ||
          user.role === Role.MANAGEMENT ||
          user.role === Role.STAFF;

        if (!canComment) {
          throw new Error('Not authorized to comment on this issue');
        }
      }

      if (announcementId) {
        const announcement = await prisma.announcement.findUnique({
          where: { id: announcementId }
        });

        if (!announcement) {
          throw new Error('Announcement not found');
        }

        
        
      }

      
      if (parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId }
        });

        if (!parentComment) {
          throw new Error('Parent comment not found');
        }

        
        if (issueId && parentComment.issueId !== issueId) {
          throw new Error('Parent comment is not on the same issue');
        }

        if (announcementId && parentComment.announcementId !== announcementId) {
          throw new Error('Parent comment is not on the same announcement');
        }

        
        if (parentComment.parentId) {
          throw new Error('Cannot reply to a reply (max 1 level deep)');
        }
      }

      
      const comment = await prisma.comment.create({
        data: {
          content,
          userId,
          issueId: issueId || null,
          announcementId: announcementId || null,
          parentId: parentId || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            }
          },
          _count: {
            select: {
              replies: true,
            }
          }
        }
      });

      logger.info({
        message: 'Comment created successfully',
        commentId: comment.id,
        userId,
        resourceId: issueId || announcementId,
        resourceType: issueId ? 'issue' : 'announcement',
      });

      return comment as CommentWithUser;
    } catch (error) {
      logger.error({
        message: 'Failed to create comment',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data,
        userId,
      });
      throw error;
    }
  }

  async getComments(
    resourceId: string,
    resourceType: 'issue' | 'announcement',
    pagination: { page: number; limit: number }
  ): Promise<PaginatedComments> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      
      const where = {
        parentId: null, 
        ...(resourceType === 'issue' 
          ? { issueId: resourceId }
          : { announcementId: resourceId }
        )
      };

      
      const total = await prisma.comment.count({ where });

      
      const topLevelComments = await prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  role: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          _count: {
            select: {
              replies: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      });

      
      const totalPages = Math.ceil(total / limit);
      const paginationInfo = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      return {
        comments: topLevelComments as CommentWithUser[],
        pagination: paginationInfo,
      };
    } catch (error) {
      logger.error({
        message: 'Failed to get comments',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        resourceId,
        resourceType,
        pagination,
      });
      throw error;
    }
  }

  async updateComment(
    commentId: string,
    newContent: string,
    userId: string
  ): Promise<CommentWithUser> {
    try {
      
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          user: {
            select: { id: true }
          }
        }
      });

      if (!existingComment) {
        throw new Error('Comment not found');
      }

      
      if (existingComment.userId !== userId) {
        throw new Error('Not authorized to update this comment');
      }

      
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          content: newContent,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            }
          },
          _count: {
            select: {
              replies: true,
            }
          }
        }
      });

      logger.info({
        message: 'Comment updated successfully',
        commentId,
        userId,
      });

      return updatedComment as CommentWithUser;
    } catch (error) {
      logger.error({
        message: 'Failed to update comment',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        commentId,
        userId,
      });
      throw error;
    }
  }

  async deleteComment(
    commentId: string,
    userId: string
  ): Promise<void> {
    try {
      
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          user: {
            select: { id: true, role: true }
          }
        }
      });

      if (!existingComment) {
        throw new Error('Comment not found');
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      
      const canDelete = 
        existingComment.userId === userId ||
        currentUser?.role === Role.MANAGEMENT ||
        currentUser?.role === Role.STAFF;

      if (!canDelete) {
        throw new Error('Not authorized to delete this comment');
      }

      
      await prisma.comment.delete({
        where: { id: commentId }
      });

      logger.info({
        message: 'Comment deleted successfully',
        commentId,
        userId,
      });
    } catch (error) {
      logger.error({
        message: 'Failed to delete comment',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        commentId,
        userId,
      });
      throw error;
    }
  }

  async getCommentById(
    commentId: string,
    userId?: string
  ): Promise<CommentWithUser | null> {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  role: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          _count: {
            select: {
              replies: true,
            }
          }
        }
      });

      if (!comment) {
        return null;
      }

      
      if (userId) {
        
        if (comment.issueId) {
          const issue = await prisma.issue.findUnique({
            where: { id: comment.issueId },
            include: {
              reportedBy: {
                select: { id: true, role: true }
              }
            }
          });

          if (!issue) {
            throw new Error('Issue not found');
          }

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
          });

          if (!user) {
            throw new Error('User not found');
          }

          const canAccess = 
            issue.visibility === IssueVisibility.PUBLIC ||
            issue.reportedBy.id === userId ||
            user.role === Role.MANAGEMENT ||
            user.role === Role.STAFF;

          if (!canAccess) {
            throw new Error('Not authorized to view this comment');
          }
        }
      }

      return comment as CommentWithUser;
    } catch (error) {
      logger.error({
        message: 'Failed to get comment by ID',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        commentId,
        userId,
      });
      throw error;
    }
  }
}

export const commentService = new CommentService();