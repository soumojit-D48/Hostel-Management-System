import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiUpload } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Announcement, CreateAnnouncementRequest } from '@/types/announcement.types';
import { toast } from 'sonner';

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnouncementRequest) => {
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      
      if (data.hostelId) {
        formData.append('hostelId', data.hostelId);
      }
      
      if (data.blockIds && data.blockIds.length > 0) {
        data.blockIds.forEach(id => formData.append('blockIds[]', id));
      }
      
      data.targetRoles.forEach(role => formData.append('targetRoles[]', role));
      
      if (data.images && data.images.length > 0) {
        data.images.forEach(image => formData.append('images', image));
      }
      
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach(file => formData.append('attachments', file));
      }

      const response = await apiUpload<ApiResponse<Announcement>>(
        '/announcements',
        formData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create announcement');
    },
  });
}

export function useMarkAnnouncementRead(announcementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiPost<ApiResponse<void>>(
        `/announcements/${announcementId}/mark-read`,
        {}
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', announcementId] });
      queryClient.invalidateQueries({ queryKey: ['announcements', 'unread-count'] });
    },
  });
}