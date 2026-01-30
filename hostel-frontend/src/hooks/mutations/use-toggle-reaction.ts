import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Reaction, ToggleReactionRequest } from '@/types/reaction.types';

export function useToggleReaction(resourceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ToggleReactionRequest) => {
      const response = await apiPost<ApiResponse<Reaction>>('/reactions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', 'counts', resourceId] });
    },
  });
}