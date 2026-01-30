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