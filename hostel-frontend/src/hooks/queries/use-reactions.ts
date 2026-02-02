import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { ReactionCounts } from '@/types/reaction.types';

export function useReactionCounts(issueId: string) {
  return useQuery({
    queryKey: ['reactions', 'counts', issueId],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<ReactionCounts>>(
        '/reactions/counts',
        { issueId }
      );
      return response.data;
    },
    enabled: !!issueId,
  });
}

interface UserReactionsParams {
  resourceId: string;
  resourceType: 'issue' | 'announcement';
}

/**
 * Hook to get user's reactions on a specific resource
 */
export function useUserReactions(params: UserReactionsParams) {
  return useQuery({
    queryKey: ['reactions', 'user-reactions', params.resourceId, params.resourceType],
    queryFn: async () => {
      const queryParams = params.resourceType === 'issue'
        ? { issueId: params.resourceId }
        : { announcementId: params.resourceId };

      const response = await apiGet<ApiResponse<any>>(
        '/reactions/user-reactions',
        queryParams
      );
      return response.data;
    },
    enabled: !!params.resourceId,
  });
}

interface ResourceReactionsParams {
  resourceId: string;
  resourceType: 'issue' | 'announcement';
  page?: number;
  limit?: number;
}

/**
 * Hook to get all reactions for a resource with pagination
 */
export function useResourceReactions(params: ResourceReactionsParams) {
  return useQuery({
    queryKey: ['reactions', 'resource', params.resourceId, params.resourceType, params.page, params.limit],
    queryFn: async () => {
      const queryParams = {
        ...(params.resourceType === 'issue'
          ? { issueId: params.resourceId }
          : { announcementId: params.resourceId }),
        ...(params.page && { page: params.page }),
        ...(params.limit && { limit: params.limit }),
      };

      const response = await apiGet<ApiResponse<any>>(
        '/reactions/resource',
        queryParams
      );
      return response.data;
    },
    enabled: !!params.resourceId,
  });
}