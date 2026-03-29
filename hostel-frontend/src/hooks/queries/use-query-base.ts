import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api-client';

export const useQueryBase = <T>(
    key: string[],
    url: string,
    options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<T>({
        queryKey: key,
        queryFn: () => ApiClient.get<T>(url),
        ...options,
    });
};
