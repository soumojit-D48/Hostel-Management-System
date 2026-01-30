import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';

export function useMarkNotificationRead(notificationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPatch<ApiResponse<void>>(
        `/notifications/${notificationId}/read`,
        {}
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPatch<ApiResponse<{ markedCount: number }>>(
        '/notifications/mark-all-read',
        {}
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}