import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useQueryBase = <T>(
    key: string[],
    url: string,
    options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<T>({
        queryKey: key,
        queryFn: () => apiClient.get<T>(url),
        ...options,
    });
};
