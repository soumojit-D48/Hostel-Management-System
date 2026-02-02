import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { ApiResponse } from '@/types/api-response';

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: 'STAFF' | 'MANAGEMENT';
    phone?: string;
    hostel?: {
        id: string;
        name: string;
    };
    specialization?: string; // e.g., "Electrical", "Plumbing", etc.
    assignedIssuesCount?: number;
    avatar?: string | null;
}

interface StaffListParams {
    hostelId?: string;
    category?: string;
    available?: boolean;
}

/**
 * Hook to fetch list of staff members for assignment
 * Filters by hostel and category if provided
 */
export function useStaffList(params?: StaffListParams) {
    return useQuery({
        queryKey: ['staff', 'list', params],
        queryFn: async () => {
            const response = await apiGet<ApiResponse<StaffMember[]>>(
                '/users/staff',
                params
            );
            return response.data;
        },
    });
}
