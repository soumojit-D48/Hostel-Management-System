import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Comment } from '@/types/comment.types';

export function useComments(issueId: string) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Comment[]>>('/comments', {
        issueId,
      });
      return response.data;
    },
    enabled: !!issueId,
  });
}