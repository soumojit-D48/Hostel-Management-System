import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api-response';
import { Issue } from '@/types/issue.types';

interface UseIssuesParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  hostelId?: string;
  blockId?: string;
}

export function useIssues(params: UseIssuesParams = {}) {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<PaginatedResponse<Issue>>>(
        '/issues',
        params
      );
      return response.data;
    },
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Issue>>(`/issues/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useIssueSearch(query: string) {
  return useQuery({
    queryKey: ['issues', 'search', query],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Issue[]>>('/issues/search', { query });
      return response.data;
    },
    enabled: query.length > 2,
  });
}

/**
 * Hook to find similar issues (Management only)
 * Used for duplicate detection before merging
 */
export function useSimilarIssues(issueId: string) {
  return useQuery({
    queryKey: ['issues', issueId, 'similar'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Issue[]>>(`/issues/${issueId}/similar`);
      return response.data;
    },
    enabled: !!issueId,
  });
}









// import { useEffect } from 'react';
// import { useQueryClient } from '@tanstack/react-query';
// import { useWebSocket } from '../use-websocket';

// // Add this hook to any component that needs real-time issue updates
// export function useIssuesRealtime() {
//   const queryClient = useQueryClient();
//   const { subscribe, unsubscribe, isConnected } = useWebSocket();

//   useEffect(() => {
//     if (!isConnected) return;

//     const handleIssueCreated = (issue: any) => {
//       console.log('🆕 Issue created:', issue);
//       queryClient.invalidateQueries({ queryKey: ['issues'] });
//     };

//     const handleIssueUpdated = (issue: any) => {
//       console.log('🔄 Issue updated:', issue);
//       queryClient.invalidateQueries({ queryKey: ['issues'] });
//       queryClient.invalidateQueries({ queryKey: ['issues', issue.id] });
//     };

//     const handleIssueStatusUpdated = (issue: any) => {
//       console.log('📊 Issue status updated:', issue);
//       queryClient.invalidateQueries({ queryKey: ['issues'] });
//       queryClient.invalidateQueries({ queryKey: ['issues', issue.id] });
//     };

//     const handleIssueAssigned = (issue: any) => {
//       console.log('👤 Issue assigned:', issue);
//       queryClient.invalidateQueries({ queryKey: ['issues'] });
//       queryClient.invalidateQueries({ queryKey: ['issues', issue.id] });
//     };

//     // Subscribe to events
//     subscribe('issue_created', handleIssueCreated);
//     subscribe('issue_updated', handleIssueUpdated);
//     subscribe('issue_status_updated', handleIssueStatusUpdated);
//     subscribe('issue_assigned', handleIssueAssigned);

//     // Cleanup
//     return () => {
//       unsubscribe('issue_created', handleIssueCreated);
//       unsubscribe('issue_updated', handleIssueUpdated);
//       unsubscribe('issue_status_updated', handleIssueStatusUpdated);
//       unsubscribe('issue_assigned', handleIssueAssigned);
//     };
//   }, [isConnected, subscribe, unsubscribe, queryClient]);
// }