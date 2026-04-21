declare module "@tanstack/react-query" {
  export interface QueryOptions<TData = unknown> {
    queryKey: readonly unknown[];
    queryFn: () => Promise<TData>;
    enabled?: boolean;
  }

  export interface MutationOptions<TVariables = void, TData = unknown> {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData) => void;
  }

  export interface UseMutationResult<TVariables = void, TData = unknown> {
    mutateAsync: (variables: TVariables) => Promise<TData>;
    isPending: boolean;
  }

  export interface QueryClient {
    invalidateQueries: (filters: { queryKey: readonly unknown[] }) => Promise<void>;
  }

  export function useQuery<TData = unknown>(options: QueryOptions<TData>): {
    data: TData | undefined;
    isLoading: boolean;
    error: unknown;
  };

  export function useMutation<TVariables = void, TData = unknown>(
    options: MutationOptions<TVariables, TData>,
  ): UseMutationResult<TVariables, TData>;

  export function useQueryClient(): QueryClient;
}
