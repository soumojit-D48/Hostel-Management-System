import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MutationBaseOptions<TData, TVariables, TContext = unknown>
    extends Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'onSuccess' | 'onError'> {
    invalidateQueries?: string[][];
    successMessage?: string;
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => unknown;
    onError?: (error: Error, variables: TVariables, context: TContext | undefined) => unknown;
}

export const useMutationBase = <TData, TVariables, TContext = unknown>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: MutationBaseOptions<TData, TVariables, TContext>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        ...options,
        onSuccess: async (data, variables, context) => {
            if (options?.invalidateQueries) {
                await Promise.all(
                    options.invalidateQueries.map((queryKey) =>
                        queryClient.invalidateQueries({ queryKey })
                    )
                );
            }

            if (options?.successMessage) {
                toast.success(options.successMessage);
            }

            if (options?.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            toast.error(error.message || 'An error occurred');
            if (options?.onError) {
                options.onError(error, variables, context);
            }
        },
    });
};
