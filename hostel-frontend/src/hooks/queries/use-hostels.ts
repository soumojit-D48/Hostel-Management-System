import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { Hostel, HostelWithBlocks, Block } from '@/types/hostel.types';

export function useHostels() {
  return useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Hostel[]>>('/hostels');
      return response.data;
    },
  });
}

export function useHostel(id: string) {
  return useQuery({
    queryKey: ['hostels', id],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<HostelWithBlocks>>(`/hostels/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useHostelBlocks(hostelId: string) {
  return useQuery({
    queryKey: ['hostels', hostelId, 'blocks'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<Block[]>>(`/hostels/${hostelId}/blocks`);
      return response.data;
    },
    enabled: !!hostelId,
  });
}