'use client';

import React, { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface QueryProviderProps {
  children: ReactNode;
  options?: {
    staleTime?: number;
    gcTime?: number;
    retry?: number;
    refetchOnWindowFocus?: boolean;
  };
}

export function QueryProvider({ children, options = {} }: QueryProviderProps): JSX.Element {
  const {
    staleTime = 60 * 1000, // 1 minute
    gcTime = 5 * 60 * 1000, // 5 minutes
    retry = 1,
    refetchOnWindowFocus = false,
  } = options;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime,
            gcTime,
            retry,
            refetchOnWindowFocus,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}