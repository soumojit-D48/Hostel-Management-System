import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiGet } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api-response';
import { Issue } from '@/types/issue.types';
import { useWebSocket } from '../use-websocket';

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
      const response = await apiGet<PaginatedResponse<Issue>>(
        '/issues',
        params
      );
      console.log('Issues API response:', response);
      return response;
    },
    staleTime: 0,
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

export function useSimilarIssues(issueId: string) {
  return useQuery({
    queryKey: ['issues', issueId, 'similar'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<any>>(`/issues/${issueId}/similar`);
      console.log('🔍 Similar Issues Response:', response.data);
      if (response.data && response.data.length > 0) {
        response.data.forEach((issue: any, index: number) => {
          console.log(`📊 Similar Issue #${index + 1}:`, {
            id: issue.issueId,
            title: issue.title,
            similarityScore: issue.similarityScore,
            category: issue.category
          });
        });
      } else {
        console.log('📭 No similar issues found');
      }
      return response.data;
    },
    enabled: !!issueId,
  });
}

export function useIssuesRealtime() {
  const queryClient = useQueryClient();
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    const handleIssueCreated = (issue: Issue) => {
      console.log('🆕 Issue created:', issue);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    };

    const handleIssueUpdated = (issue: Issue) => {
      console.log('🔄 Issue updated:', issue);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', issue.id] });
    };

    const handleIssueStatusUpdated = (issue: Issue) => {
      console.log('📊 Issue status updated:', issue);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', issue.id] });
    };

    const handleIssueAssigned = (issue: Issue) => {
      console.log('👤 Issue assigned:', issue);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', issue.id] });
    };

    subscribe('issue_created', handleIssueCreated);
    subscribe('issue_updated', handleIssueUpdated);
    subscribe('issue_status_updated', handleIssueStatusUpdated);
    subscribe('issue_assigned', handleIssueAssigned);

    return () => {
      unsubscribe('issue_created', handleIssueCreated);
      unsubscribe('issue_updated', handleIssueUpdated);
      unsubscribe('issue_status_updated', handleIssueStatusUpdated);
      unsubscribe('issue_assigned', handleIssueAssigned);
    };
  }, [isConnected, subscribe, unsubscribe, queryClient]);
}