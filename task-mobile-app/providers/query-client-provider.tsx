import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

// Create a single global QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Only retry on network/server errors (5xx), NOT on client errors (4xx like 401/403/404)
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        // Don't retry on client errors — retrying 401/403 loops forever
        if (status && status >= 400 && status < 500) return false;
        // Max 1 retry for server/network errors
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache validity
    },
    mutations: {
      // Global mutation error handler — prevents unhandled rejections from crashing the app
      onError: (error: any) => {
        console.warn('[QueryClient] Mutation error:', error?.message ?? error);
      },
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
}
