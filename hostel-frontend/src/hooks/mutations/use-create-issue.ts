import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUpload } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Issue, CreateIssueRequest } from '@/types/issue.types';
import { toast } from 'sonner';

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIssueRequest) => {
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      formData.append('visibility', data.visibility);
      
      if (data.location) {
        formData.append('location', data.location);
      }
      
      if (data.roomNumber) {
        formData.append('roomNumber', data.roomNumber);
      }
      
      // Append images
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await apiUpload<ApiResponse<Issue>>('/issues', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create issue');
    },
  });
}