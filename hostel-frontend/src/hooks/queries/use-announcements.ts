import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api-response';
import { Announcement } from '@/types/announcement.types';

interface UseAnnouncementsParams {
  page?: number;
  limit?: number;
  category?: string;
  unreadOnly?: boolean;
}

export function useAnnouncements(params: UseAnnouncementsParams = {}) {
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: async () => {
      const response = await apiGet<PaginatedResponse<Announcement>>(
        '/announcements',
        params
      );
      return response;
    },
  });
}

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: ['announcements', id],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Announcement>>(`/announcements/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUnreadAnnouncementsCount() {
  return useQuery({
    queryKey: ['announcements', 'unread-count'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<{ count: number }>>(
        '/announcements/unread-count'
      );
      return response.data;
    },
  });
}