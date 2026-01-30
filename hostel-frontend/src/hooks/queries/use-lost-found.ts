import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api-response';
import { LostFoundItem, LostFoundClaim } from '@/types/lost-found.types';

interface UseLostFoundParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}

export function useLostFoundItems(params: UseLostFoundParams = {}) {
  return useQuery({
    queryKey: ['lost-found', params],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<PaginatedResponse<LostFoundItem>>>(
        '/lost-found',
        params
      );
      return response.data;
    },
  });
}

export function useLostFoundItem(id: string) {
  return useQuery({
    queryKey: ['lost-found', id],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<LostFoundItem>>(`/lost-found/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function usePendingClaims() {
  return useQuery({
    queryKey: ['lost-found', 'claims', 'pending'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<LostFoundClaim[]>>(
        '/lost-found/claims/pending'
      );
      return response.data;
    },
  });
}