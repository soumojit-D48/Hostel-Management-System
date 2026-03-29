
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '@/types/comment.types';
import { toast } from 'sonner';

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const response = await apiPost<ApiResponse<Comment>>('/comments', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      let queryKey: string[] = [];
      if (variables.issueId) {
        queryKey = ['comments', 'issue', variables.issueId];
      } else if (variables.announcementId) {
        queryKey = ['comments', 'announcement', variables.announcementId];
      } else if (variables.lostFoundId) {
        queryKey = ['comments', 'lostFound', variables.lostFoundId];
      }
      queryClient.invalidateQueries({ queryKey });
      toast.success('Comment added');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
}

export function useUpdateComment(commentId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommentRequest) => {
      const response = await apiPatch<ApiResponse<Comment>>(
        `/comments/${commentId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      toast.success('Comment updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });
}

export function useDeleteComment(commentId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiDelete<ApiResponse<void>>(`/comments/${commentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      toast.success('Comment deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
}