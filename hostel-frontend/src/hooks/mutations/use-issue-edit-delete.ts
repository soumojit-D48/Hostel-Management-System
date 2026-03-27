import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiDelete } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Issue } from '@/types/issue.types';
import { toast } from 'sonner';

interface UpdateIssueRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  visibility?: string;
  location?: string;
  roomNumber?: string;
}

export function useUpdateIssue(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateIssueRequest) => {
      const response = await apiPatch<ApiResponse<Issue>>(
        `/issues/${issueId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update issue');
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      const response = await apiDelete<ApiResponse<void>>(
        `/issues/${issueId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete issue');
    },
  });
}
