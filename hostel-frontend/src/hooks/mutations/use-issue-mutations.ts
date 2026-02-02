import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiPost } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Issue } from '@/types/issue.types';
import { toast } from 'sonner';

interface AssignIssueRequest {
    assignedToId: string;
    note?: string;
    deadline?: string;
}

interface MergeIssuesRequest {
    duplicateIssueIds: string[];
}

/**
 * Hook to assign an issue to a staff member (Management only)
 */
export function useAssignIssue(issueId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AssignIssueRequest) => {
            const response = await apiPatch<ApiResponse<Issue>>(
                `/issues/${issueId}/assign`,
                data
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
            queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
            toast.success('Issue assigned successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to assign issue');
        },
    });
}

/**
 * Hook to merge duplicate issues into one (Management only)
 */
export function useMergeIssues(issueId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: MergeIssuesRequest) => {
            const response = await apiPost<ApiResponse<Issue>>(
                `/issues/${issueId}/merge`,
                data
            );
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
            queryClient.invalidateQueries({ queryKey: ['issues', issueId] });
            // Invalidate all merged issue queries
            variables.duplicateIssueIds.forEach(id => {
                queryClient.invalidateQueries({ queryKey: ['issues', id] });
            });
            toast.success('Issues merged successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to merge issues');
        },
    });
}
