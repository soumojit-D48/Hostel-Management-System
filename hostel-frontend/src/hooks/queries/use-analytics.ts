import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';
import { 
  DashboardAnalytics, 
  CategoryBreakdown, 
  TrendData,
  StaffPerformance 
} from '@/types/analytics.types';

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<DashboardAnalytics>>(
        '/analytics/dashboard'
      );
      return response.data;
    },
  });
}

export function useCategoryBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<CategoryBreakdown[]>>(
        '/analytics/categories'
      );
      return response.data;
    },
  });
}

export function useIssueTrends(days: number = 7) {
  return useQuery({
    queryKey: ['analytics', 'trends', days],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<TrendData[]>>(
        '/analytics/trends',
        { days }
      );
      return response.data;
    },
  });
}

export function useStaffPerformance() {
  return useQuery({
    queryKey: ['analytics', 'staff-performance'],
    queryFn: async () => {
      const response = await apiGet<ApiResponse<StaffPerformance[]>>(
        '/analytics/staff-performance'
      );
      return response.data;
    },
  });
}