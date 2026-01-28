import { prisma } from '../../config/database';
import { 
  Reaction, 
  Issue, 
  Announcement, 
  IssueVisibility,
  Role,
  User 
} from '@prisma/client';
import { logger } from '../../shared/services/logger.service';
import { ReactionInput, GetReactionCountsInput } from '../comments/comment.validation';

interface ReactionResult {
  reacted: boolean;
  reactionType?: string;
  counts: Record<string, number>;
}

interface ReactionWithUser extends Reaction {
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    role: Role;
  };
}

class ReactionService {
  async addReaction(
    data: ReactionInput,
    userId: string
  ): Promise<ReactionResult> {
    try {
      const { issueId, announcementId, type } = data;
      const resourceId = issueId || announcementId;
      const resourceType = issueId ? 'issue' : 'announcement';

      
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

        
        const canReact = 
          issue.visibility === IssueVisibility.PUBLIC ||
          issue.reportedBy.id === userId ||
          user.role === Role.MANAGEMENT ||
          user.role === Role.STAFF;

        if (!canReact) {
          throw new Error('Not authorized to react to this issue');
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

      
      const whereClause = {
        userId,
        type,
        ...(issueId ? { issueId } : { announcementId })
      };

      const existingReaction = await prisma.reaction.findFirst({
        where: whereClause
      });

      let reacted = false;
      let reactionType = undefined;

      if (existingReaction) {
        
        await prisma.reaction.delete({
          where: { id: existingReaction.id }
        });
        
        logger.info({
          message: 'Reaction removed (toggled off)',
          reactionId: existingReaction.id,
          userId,
          resourceId,
          resourceType,
          reactionType: type,
        });
      } else {
        
        await prisma.reaction.create({
          data: {
            type,
            userId,
            issueId: issueId || null,
            announcementId: announcementId || null,
          }
        });

        reacted = true;
        reactionType = type;

        logger.info({
          message: 'Reaction added',
          userId,
          resourceId,
          resourceType,
          reactionType: type,
        });
      }

      
      const counts = await this.getReactionCountsInternal(resourceId!, resourceType);

      return {
        reacted,
        reactionType,
        counts,
      };
    } catch (error) {
      logger.error({
        message: 'Failed to add/remove reaction',
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

  async getReactionCounts(
    resourceId: string,
    resourceType: 'issue' | 'announcement'
  ): Promise<Record<string, number>> {
    try {
      return await this.getReactionCountsInternal(resourceId, resourceType);
    } catch (error) {
      logger.error({
        message: 'Failed to get reaction counts',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        resourceId,
        resourceType,
      });
      throw error;
    }
  }

  async getUserReactions(
    resourceId: string,
    resourceType: 'issue' | 'announcement',
    userId: string
  ): Promise<string[]> {
    try {
      
      if (resourceType === 'issue') {
        const issue = await prisma.issue.findUnique({
          where: { id: resourceId },
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

        
        const canView = 
          issue.visibility === IssueVisibility.PUBLIC ||
          issue.reportedBy.id === userId ||
          user.role === Role.MANAGEMENT ||
          user.role === Role.STAFF;

        if (!canView) {
          throw new Error('Not authorized to view reactions on this issue');
        }
      }

      if (resourceType === 'announcement') {
        const announcement = await prisma.announcement.findUnique({
          where: { id: resourceId }
        });

        if (!announcement) {
          throw new Error('Announcement not found');
        }

        
        
      }

      
      const userReactions = await prisma.reaction.findMany({
        where: {
          userId,
          ...(resourceType === 'issue' 
            ? { issueId: resourceId }
            : { announcementId: resourceId })
        },
        select: {
          type: true,
        }
      });

      return userReactions.map(reaction => reaction.type);
    } catch (error) {
      logger.error({
        message: 'Failed to get user reactions',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        resourceId,
        resourceType,
        userId,
      });
      throw error;
    }
  }

  async getReactionsByResource(
    resourceId: string,
    resourceType: 'issue' | 'announcement',
    pagination?: { page: number; limit: number }
  ): Promise<{
    reactions: ReactionWithUser[];
    counts: Record<string, number>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      
      if (resourceType === 'issue') {
        const issue = await prisma.issue.findUnique({
          where: { id: resourceId },
          include: {
            reportedBy: {
              select: { id: true, role: true }
            }
          }
        });

        if (!issue) {
          throw new Error('Issue not found');
        }

        
        
      }

      if (resourceType === 'announcement') {
        const announcement = await prisma.announcement.findUnique({
          where: { id: resourceId }
        });

        if (!announcement) {
          throw new Error('Announcement not found');
        }
      }

      let reactions: ReactionWithUser[];
      let paginationInfo;

      if (pagination) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        
        const total = await prisma.reaction.count({
          where: {
            ...(resourceType === 'issue' 
              ? { issueId: resourceId }
              : { announcementId: resourceId })
          }
        });

        
        const paginatedReactions = await prisma.reaction.findMany({
          where: {
            ...(resourceType === 'issue' 
              ? { issueId: resourceId }
              : { announcementId: resourceId })
          },
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
            createdAt: 'desc'
          },
          skip,
          take: limit,
        });

        reactions = paginatedReactions as ReactionWithUser[];

        
        const totalPages = Math.ceil(total / limit);
        paginationInfo = {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        };
      } else {
        
        const allReactions = await prisma.reaction.findMany({
          where: {
            ...(resourceType === 'issue' 
              ? { issueId: resourceId }
              : { announcementId: resourceId })
          },
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
            createdAt: 'desc'
          }
        });

        reactions = allReactions as ReactionWithUser[];
      }

      
      const counts = await this.getReactionCountsInternal(resourceId, resourceType);

      return {
        reactions,
        counts,
        pagination: paginationInfo,
      };
    } catch (error) {
      logger.error({
        message: 'Failed to get reactions by resource',
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

  private async getReactionCountsInternal(
    resourceId: string,
    resourceType: 'issue' | 'announcement'
  ): Promise<Record<string, number>> {
    const whereClause = {
      ...(resourceType === 'issue' 
        ? { issueId: resourceId }
        : { announcementId: resourceId })
    };

    const reactions = await prisma.reaction.findMany({
      where: whereClause,
      select: {
        type: true,
      }
    });

    
    const counts: Record<string, number> = {};
    reactions.forEach(reaction => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });

    
    const possibleTypes = ['helpful', 'urgent', 'resolved', 'watching'];
    possibleTypes.forEach(type => {
      if (!counts[type]) {
        counts[type] = 0;
      }
    });

    return counts;
  }

  async removeReaction(
    reactionId: string,
    userId: string
  ): Promise<void> {
    try {
      
      const existingReaction = await prisma.reaction.findUnique({
        where: { id: reactionId },
        include: {
          user: {
            select: { id: true, role: true }
          }
        }
      });

      if (!existingReaction) {
        throw new Error('Reaction not found');
      }

      
      const canDelete = 
        existingReaction.userId === userId ||
        existingReaction.user?.role === Role.MANAGEMENT;

      if (!canDelete) {
        throw new Error('Not authorized to remove this reaction');
      }

      
      await prisma.reaction.delete({
        where: { id: reactionId }
      });

      const resourceId = existingReaction.issueId || existingReaction.announcementId;
      const resourceType = existingReaction.issueId ? 'issue' : 'announcement';

      logger.info({
        message: 'Reaction removed',
        reactionId,
        userId,
        resourceId,
        resourceType,
        reactionType: existingReaction.type,
      });
    } catch (error) {
      logger.error({
        message: 'Failed to remove reaction',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        reactionId,
        userId,
      });
      throw error;
    }
  }
}

export const reactionService = new ReactionService();