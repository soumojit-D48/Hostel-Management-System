import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api-response';
import { Notification } from '@/types/notification.types';

interface UseNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
}

export function useNotifications(params: UseNotificationsParams = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<PaginatedResponse<Notification>>>(
        '/notifications',
        params
      );
      return response.data;
    },
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<{ count: number }>>(
        '/notifications/unread-count'
      );
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}