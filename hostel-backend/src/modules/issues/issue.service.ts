import { prisma } from '../../config/database';
import { 
  IssueStatus, 
  IssuePriority, 
  IssueCategory, 
  IssueVisibility, 
  Role,
  type User,
  type Issue,
  type Hostel,
  type Block
} from '@prisma/client';
import { uploadService } from '../../shared/services/upload.service';
import { logger } from '../../shared/services/logger.service';
import { AuthenticatedRequest } from '../../shared/types';
import { 
  CreateIssueInput, 
  GetIssuesInput, 
  GetIssueByIdInput, 
  SearchIssuesInput 
} from './issue.validation';
import {
  calculateTextSimilarity,
  calculateIssueSimilarity,
  sortBySimilarity,
  filterBySimilarity
} from '../../shared/utils/similarity';
import { ValidationError, NotFoundError, ForbiddenError } from '../../shared/middleware/error.middleware';

interface IssueFilters {
  status?: IssueStatus | undefined;
  category?: IssueCategory | undefined;
  priority?: IssuePriority | undefined;
  visibility?: IssueVisibility | undefined;
  hostelId?: string | undefined;
  blockId?: string | undefined;
  search?: string | undefined;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class IssueService {
  async createIssue(
    data: CreateIssueInput,
    files: { images?: Express.Multer.File[]; videos?: Express.Multer.File[] },
    userId: string
  ): Promise<Issue> {
    try {
      // Get user details for auto-filling location info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          hostelId: true,
          blockId: true,
          roomNumber: true,
          hostel: {
            select: { id: true, name: true }
          },
          block: {
            select: { id: true, name: true }
          }
        }
      });

      if (!user) {
        throw new ValidationError('User not found');
      }

      // Process uploaded images
      const imageUrls: string[] = [];
      if (files.images) {
        for (const image of files.images) {
          const result = await uploadService.uploadImage(image);
          imageUrls.push(result.url);
        }
      }

      // Process uploaded videos
      const videoUrls: string[] = [];
      if (files.videos) {
        for (const video of files.videos) {
          const result = await uploadService.uploadVideo(video);
          videoUrls.push(result.url);
        }
      }

      // Create issue with all data
      const issue = await prisma.issue.create({
        data: {
          ...data,
          images: imageUrls,
          videos: videoUrls,
          reportedById: userId,
          hostelId: user.hostelId,
          blockId: user.blockId,
          roomNumber: user.roomNumber,
          status: IssueStatus.REPORTED,
        },
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          block: {
            select: {
              id: true,
              name: true,
            }
          },
        }
      });

      // Create initial status history entry
      await prisma.issueStatusHistory.create({
        data: {
          issueId: issue.id,
          status: IssueStatus.REPORTED,
          remarks: 'Issue reported by user',
          changedById: userId,
        } as any
      });

      logger.info({
        message: 'Issue created successfully',
        data: {
          issueId: issue.id,
          title: issue.title,
          category: issue.category,
          reportedBy: userId,
        }
      });

      return issue;
    } catch (error) {
      logger.error({
        message: 'Failed to create issue',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: {
          userId,
          issueData: data,
        }
      });
      throw error;
    }
  }

  async getIssues(
    userId: string,
    userRole: Role,
    filters: any,
    pagination: any
  ): Promise<{ issues: Issue[]; total: number; totalPages: number }> {
    try {
      const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      // Build where clause based on user role
      let whereClause: any = {};

      if (userRole === Role.STUDENT) {
        // Students see their own issues + public issues from same hostel
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { hostelId: true }
        });

        whereClause = {
          OR: [
            { reportedById: userId }, // Own issues (any visibility)
            { 
              visibility: IssueVisibility.PUBLIC,
              hostelId: user?.hostelId // Public issues from same hostel
            }
          ]
        };
      } else if (userRole === Role.STAFF) {
        // Staff see assigned issues + public issues
        whereClause = {
          OR: [
            { assignedToId: userId }, // Assigned issues
            { visibility: IssueVisibility.PUBLIC } // All public issues
          ]
        };
      } else if (userRole === Role.MANAGEMENT) {
        // Management sees all issues
        whereClause = {};
      }

      // Apply filters
      if (filters.status) {
        whereClause.status = filters.status;
      }
      if (filters.category) {
        whereClause.category = filters.category;
      }
      if (filters.priority) {
        whereClause.priority = filters.priority;
      }
      if (filters.visibility) {
        whereClause.visibility = filters.visibility;
      }
      if (filters.hostelId) {
        whereClause.hostelId = filters.hostelId;
      }
      if (filters.blockId) {
        whereClause.blockId = filters.blockId;
      }
      if (filters.search) {
        whereClause.OR = [
          {
            title: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        ];
      }
      if (filters.dateFrom || filters.dateTo) {
        whereClause.createdAt = {};
        if (filters.dateFrom) {
          whereClause.createdAt.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          whereClause.createdAt.lte = filters.dateTo;
        }
      }

      // Exclude merged issues from main listing
      whereClause.isMerged = false;

      // Get total count for pagination
      const total = await prisma.issue.count({ where: whereClause });

      // Get issues with pagination
      const issues = await prisma.issue.findMany({
        where: whereClause,
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              hostel: { select: { name: true } },
              block: { select: { name: true } },
              roomNumber: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          block: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              comments: true,
              reactions: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        issues,
        total,
        totalPages,
      };
    } catch (error) {
      logger.error({
        message: 'Failed to get issues',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: {
          userId,
          userRole,
          filters,
          pagination,
        }
      });
      throw error;
    }
  }

  async getIssueById(
    issueId: string,
    userId: string,
    userRole: Role
  ): Promise<Issue> {
    try {
      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              hostel: { select: { name: true } },
              block: { select: { name: true } },
              roomNumber: true,
              phone: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          block: {
            select: {
              id: true,
              name: true,
            }
          },
          statusHistory: {
            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                }
              }
            },
            orderBy: {
              changedAt: 'asc'
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                }
              },
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true,
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                }
              }
            }
          },
          mergedIssues: {
            select: {
              id: true,
              title: true,
              reportedById: true,
            }
          }
        }
      } as any);

      if (!issue) {
        throw new NotFoundError('Issue not found');
      }

      // Check visibility permissions
      if (issue.visibility === IssueVisibility.PRIVATE) {
        const hasAccess = 
          issue.reportedById === userId || // Reporter
          (userRole === Role.MANAGEMENT) || // Management
          (issue.assignedToId === userId); // Assigned staff

        if (!hasAccess) {
          throw new ForbiddenError('Access denied to this private issue');
        }
      }

      // If this is a merged issue, return the parent issue instead
      if (issue.isMerged && issue.parentIssueId) {
        return this.getIssueById(issue.parentIssueId, userId, userRole);
      }

      return issue;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }

      logger.error({
        message: 'Failed to get issue by ID',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: {
          issueId,
          userId,
          userRole,
        }
      });
      throw error;
    }
  }

    async searchIssues(
    query: string,
    filters: any,
    userId: string,
    userRole: Role,
    pagination: any
  ): Promise<{ issues: Issue[]; total: number; totalPages: number }> {
    try {
      const searchFilters = {
        ...filters,
        search: query
      };

      return this.getIssues(userId, userRole, searchFilters, pagination);
    } catch (error) {
      logger.error({
        message: 'Failed to search issues',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: {
          query,
          userId,
          userRole,
        }
      });
      throw error;
    }
  }

  async updateIssueStatus(
    issueId: string,
    newStatus: IssueStatus,
    remarks: string | undefined,
    userId: string,
    userRole: Role
  ): Promise<Issue> {
    try {
      const currentIssue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: {
          id: true,
          status: true,
          assignedToId: true,
          reportedById: true,
        }
      });

      if (!currentIssue) {
        throw new NotFoundError('Issue not found');
      }

      // Validate status transitions based on role and current status
      const isValidTransition = this.validateStatusTransition(
        currentIssue.status,
        newStatus,
        userRole,
        currentIssue.assignedToId === userId
      );

      if (!isValidTransition.valid) {
        throw new ValidationError(isValidTransition.error || 'Invalid status transition');
      }

      // Prepare update data with appropriate timestamp
      const updateData: any = { status: newStatus };
      const now = new Date();

      switch (newStatus) {
        case IssueStatus.ASSIGNED:
          updateData.assignedAt = now;
          break;
        case IssueStatus.IN_PROGRESS:
          updateData.inProgressAt = now;
          break;
        case IssueStatus.RESOLVED:
          updateData.resolvedAt = now;
          break;
        case IssueStatus.CLOSED:
          updateData.closedAt = now;
          break;
      }

      // Update issue status
      const updatedIssue = await prisma.issue.update({
        where: { id: issueId },
        data: updateData,
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          block: {
            select: {
              id: true,
              name: true,
            }
          },
        }
      });

      // Create status history entry
      await prisma.issueStatusHistory.create({
        data: {
          issueId,
          status: newStatus,
          remarks: remarks || null,
          changedById: userId,
          changedAt: now,
        }
      });

      logger.info({
        message: 'Issue status updated',
        data: {
          issueId,
          oldStatus: currentIssue.status,
          newStatus,
          updatedBy: userId,
          remarks,
        }
      });

      return updatedIssue;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error({
        message: 'Failed to update issue status',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: {
          issueId,
          newStatus,
          userId,
          userRole,
        }
      });
      throw error;
    }
  }

  async assignIssue(
    issueId: string,
    assignedToId: string,
    note: string | undefined,
    deadline: Date | undefined,
    managementUserId: string
  ): Promise<Issue> {
    try {
      // Verify assigned staff exists and has STAFF role
      const assignedStaff = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        }
      });

      if (!assignedStaff) {
        throw new NotFoundError('Staff member not found');
      }

      if (assignedStaff.role !== Role.STAFF) {
        throw new ValidationError('Can only assign issues to staff members');
      }

      // Get current issue
      const currentIssue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: {
          id: true,
          status: true,
          assignedToId: true,
        }
      });

      if (!currentIssue) {
        throw new NotFoundError('Issue not found');
      }

      // Prepare update data
      const updateData: any = { assignedToId };
      const now = new Date();

      // If issue is currently REPORTED, change status to ASSIGNED and set timestamp
      if (currentIssue.status === IssueStatus.REPORTED) {
        updateData.status = IssueStatus.ASSIGNED;
        updateData.assignedAt = now;
      }

      // Update issue
      const updatedIssue = await prisma.issue.update({
        where: { id: issueId },
        data: updateData,
        include: {
          reportedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            }
          },
          hostel: {
            select: {
              id: true,
              name: true,
            }
          },
          block: {
            select: {
              id: true,
              name: true,
            }
          },
        }
      });

      // Create status history entry
      await prisma.issueStatusHistory.create({
        data: {
          issueId,
          status: updatedIssue.status,
          remarks: note || `Issue assigned to ${assignedStaff.name}`,
          changedById: managementUserId,
          changedAt: now,
        }
      });

      logger.info({
        message: 'Issue assigned',
        data: {
          issueId,
          assignedToId,
          assignedToName: assignedStaff.name,
          assignedBy: managementUserId,
          note,
        }
      });

      return updatedIssue;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error({
        message: 'Failed to assign issue',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: {
          issueId,
          assignedToId,
          managementUserId,
        }
      });
      throw error;
    }
  }

  private validateStatusTransition(
    currentStatus: IssueStatus,
    newStatus: IssueStatus,
    userRole: Role,
    isAssignedStaff: boolean
  ): { valid: boolean; error?: string } {
    // Define allowed transitions
    const allowedTransitions: Record<IssueStatus, IssueStatus[]> = {
      [IssueStatus.REPORTED]: [IssueStatus.ASSIGNED],
      [IssueStatus.ASSIGNED]: [IssueStatus.IN_PROGRESS, IssueStatus.REPORTED], // Allow going back for management
      [IssueStatus.IN_PROGRESS]: [IssueStatus.RESOLVED, IssueStatus.ASSIGNED], // Allow going back for management
      [IssueStatus.RESOLVED]: [IssueStatus.CLOSED, IssueStatus.IN_PROGRESS], // Allow reopening
      [IssueStatus.CLOSED]: [IssueStatus.REPORTED], // Allow reopening by management
    };

    // Check if transition is allowed
    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return {
        valid: false,
        error: `Cannot change status from ${currentStatus} to ${newStatus}`
      };
    }

    // Role-based permissions
    switch (newStatus) {
      case IssueStatus.ASSIGNED:
        // Only MANAGEMENT can assign issues
        if (userRole !== Role.MANAGEMENT) {
          return {
            valid: false,
            error: 'Only management can assign issues'
          };
        }
        break;

      case IssueStatus.IN_PROGRESS:
        // STAFF can only update to IN_PROGRESS if assigned to them
        // MANAGEMENT can always update
        if (userRole === Role.STAFF && !isAssignedStaff) {
          return {
            valid: false,
            error: 'Staff can only update status of assigned issues'
          };
        }
        break;

      case IssueStatus.RESOLVED:
        // STAFF can only resolve if assigned to them
        // MANAGEMENT can always resolve
        if (userRole === Role.STAFF && !isAssignedStaff) {
          return {
            valid: false,
            error: 'Staff can only resolve assigned issues'
          };
        }
        break;

      case IssueStatus.CLOSED:
        // Only MANAGEMENT can close issues
        if (userRole !== Role.MANAGEMENT) {
          return {
            valid: false,
            error: 'Only management can close issues'
          };
        }
        break;

      case IssueStatus.REPORTED:
        // Only MANAGEMENT can reopen (change from CLOSED to REPORTED)
        if (userRole !== Role.MANAGEMENT) {
          return {
            valid: false,
            error: 'Only management can reopen issues'
          };
        }
        break;
    }

    return { valid: true };
  }

  async findSimilarIssues(issueId: string): Promise<any[]> {
    try {
      // Fetch the current issue
      const currentIssue = await prisma.issue.findUnique({
        where: { id: issueId },
        select: {
          id: true,
          title: true,
          category: true,
          hostelId: true,
          blockId: true,
          status: true,
          createdAt: true,
        }
      });

      if (!currentIssue) {
        throw new NotFoundError('Issue not found');
      }

      // Only look for similar issues if current issue is REPORTED or ASSIGNED
      if (currentIssue.status !== IssueStatus.REPORTED && currentIssue.status !== IssueStatus.ASSIGNED) {
        return [];
      }

      // Query for potential duplicates with same category and location
      const potentialDuplicates = await prisma.issue.findMany({
        where: {
          id: { not: issueId }, // Exclude current issue
          category: currentIssue.category,
          hostelId: currentIssue.hostelId,
          blockId: currentIssue.blockId,
          status: { in: [IssueStatus.REPORTED, IssueStatus.ASSIGNED] }, // Only active issues
          isMerged: false, // Exclude already merged issues
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          id: true,
          title: true,
          category: true,
          hostelId: true,
          blockId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20 // Limit to 20 most recent potential matches
      });

      // Calculate similarity scores for each potential duplicate
      const issuesWithSimilarity = potentialDuplicates.map(issue => ({
        issueId: issue.id,
        title: issue.title,
        category: issue.category,
        hostelId: issue.hostelId,
        blockId: issue.blockId,
        createdAt: issue.createdAt,
        similarityScore: calculateIssueSimilarity(
          currentIssue.title,
          issue.title,
          currentIssue.category,
          issue.category,
          currentIssue.hostelId,
          issue.hostelId,
          currentIssue.blockId,
          issue.blockId
        )
      }));

      // Filter by threshold and sort by similarity
      const similarIssues = filterBySimilarity(issuesWithSimilarity, 0.7);
      const sortedIssues = sortBySimilarity(similarIssues);

      return sortedIssues.slice(0, 10); // Return top 10 matches
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      logger.error({
        message: 'Failed to find similar issues',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: { issueId }
      });
      throw error;
    }
  }

  async mergeIssues(
    primaryIssueId: string,
    duplicateIssueIds: string[],
    managementUserId: string
  ): Promise<any> {
    try {
      // Validate all issue IDs exist
      const allIssueIds = [primaryIssueId, ...duplicateIssueIds];
      const issues = await prisma.issue.findMany({
        where: {
          id: { in: allIssueIds }
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          hostelId: true,
          blockId: true,
          status: true,
          images: true,
          videos: true,
          reportedById: true,
          assignedToId: true,
          isMerged: true,
          parentIssueId: true,
        }
      });

      if (issues.length !== allIssueIds.length) {
        throw new ValidationError('One or more issue IDs not found');
      }

      const primaryIssue = issues.find(issue => issue.id === primaryIssueId);
      const duplicateIssues = issues.filter(issue => duplicateIssueIds.includes(issue.id));

      if (!primaryIssue) {
        throw new ValidationError('Primary issue not found');
      }

      // Validate issues can be merged (same category and hostel)
      const canMerge = duplicateIssues.every(issue => 
        issue.category === primaryIssue.category && 
        issue.hostelId === primaryIssue.hostelId &&
        !issue.isMerged // Cannot merge already merged issues
      );

      if (!canMerge) {
        throw new ValidationError('Issues must have same category and hostel to merge');
      }

      // Start transaction to merge issues
      const mergedIssue = await prisma.$transaction(async (tx) => {
        // Mark duplicate issues as merged
        await tx.issue.updateMany({
          where: {
            id: { in: duplicateIssueIds }
          },
          data: {
            isMerged: true,
            parentIssueId: primaryIssueId
          }
        });

        // Transfer all comments from duplicate issues to primary issue
        await tx.comment.updateMany({
          where: {
            issueId: { in: duplicateIssueIds }
          },
          data: {
            issueId: primaryIssueId
          }
        });

        // Transfer all reactions from duplicate issues to primary issue
        await tx.reaction.updateMany({
          where: {
            issueId: { in: duplicateIssueIds }
          },
          data: {
            issueId: primaryIssueId
          }
        });

        // Combine all images and videos from duplicate issues into primary issue
        const allImages = [...(primaryIssue.images || []), ...duplicateIssues.flatMap(issue => issue.images || [])];
        const allVideos = [...(primaryIssue.videos || []), ...duplicateIssues.flatMap(issue => issue.videos || [])];

        // Update primary issue with merged content
        const updatedPrimaryIssue = await tx.issue.update({
          where: { id: primaryIssueId },
          data: {
            images: allImages,
            videos: allVideos
          },
          include: {
            reportedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              }
            },
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              }
            },
            hostel: {
              select: {
                id: true,
                name: true,
              }
            },
            block: {
              select: {
                id: true,
                name: true,
              }
            },
          }
        });

        // Create merge history entry
        await tx.issueStatusHistory.create({
          data: {
            issueId: primaryIssueId,
            status: primaryIssue.status,
            remarks: `Consolidated ${duplicateIssues.length} duplicate issues: ${duplicateIssues.map(issue => issue.id).join(', ')}`,
            changedById: managementUserId,
            changedAt: new Date(),
          }
        });

        return updatedPrimaryIssue;
      });

      logger.info({
        message: 'Issues merged successfully',
        data: {
          primaryIssueId,
          duplicateIssueIds,
          mergedBy: managementUserId,
          duplicateCount: duplicateIssues.length
        }
      });

      return mergedIssue;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      logger.error({
        message: 'Failed to merge issues',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        data: {
          primaryIssueId,
          duplicateIssueIds,
          managementUserId
        }
      });
      throw error;
    }
  }
}

export const issueService = new IssueService();