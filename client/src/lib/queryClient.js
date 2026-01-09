import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for React Query
 * Exported separately to allow access from socket service for cache invalidation
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
