import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Issue, UpdateIssueStatusRequest } from '@/types/issue.types';
import { toast } from 'sonner';

export function useUpdateIssueStatus(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateIssueStatusRequest) => {
      const response = await apiPatch<ApiResponse<Issue>>(
        `/issues/${issueId}/status`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
      toast.success('Issue status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update issue status');
    },
  });
}