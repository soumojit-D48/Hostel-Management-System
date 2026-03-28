import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Comment } from '@/types/comment.types';

export function useComments(resourceId: string, isAnnouncement: boolean = false) {
  return useQuery({
    queryKey: ['comments', isAnnouncement ? 'announcement' : 'issue', resourceId],
    queryFn: async () => {
      const params = isAnnouncement 
        ? { announcementId: resourceId }
        : { issueId: resourceId };
      const response = await apiGet<ApiResponse<Comment[]>>('/comments', params);
      return response.data;
    },
    enabled: !!resourceId,
  });
}

/**
 * Hook to get a single comment by ID
 */
export function useComment(commentId: string) {
  return useQuery({
    queryKey: ['comments', 'single', commentId],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Comment>>(`/comments/${commentId}`);
      return response.data;
    },
    enabled: !!commentId,
  });
}