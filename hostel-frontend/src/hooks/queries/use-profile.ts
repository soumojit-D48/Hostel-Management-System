import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  avatar?: string;
  role: 'STUDENT' | 'STAFF' | 'MANAGEMENT';
  rollNumber?: string;
  roomNumber?: string;
  hostel?: {
    id: string;
    name: string;
  };
  block?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  emergencyContact?: string;
  avatar?: string;
}

/**
 * Hook to fetch current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<UserProfile>>('/users/profile');
      return response.data;
    },
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await apiPatch<ApiResponse<UserProfile>>('/users/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
