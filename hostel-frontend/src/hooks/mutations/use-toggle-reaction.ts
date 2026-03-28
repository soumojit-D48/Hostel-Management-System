import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiDelete } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Reaction, ToggleReactionRequest } from '@/types/reaction.types';

export function useToggleReaction(resourceId: string, resourceType: 'issue' | 'announcement' = 'issue') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ToggleReactionRequest) => {
      const payload = resourceType === 'issue'
        ? { issueId: resourceId, type: data.type }
        : { announcementId: resourceId, type: data.type };
      
      const response = await apiPost<ApiResponse<Reaction>>('/reactions', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', 'counts'] });
      queryClient.invalidateQueries({ queryKey: ['reactions', 'user-reactions'] });
    },
  });
}

/**
 * Hook to remove a specific reaction by ID
 */
export function useRemoveReaction(reactionId: string, resourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiDelete<ApiResponse<void>>(`/reactions/${reactionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', 'counts', resourceId] });
      queryClient.invalidateQueries({ queryKey: ['reactions', 'user-reactions'] });
      queryClient.invalidateQueries({ queryKey: ['reactions', 'resource'] });
    },
  });
}