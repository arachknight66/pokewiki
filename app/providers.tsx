'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider } from 'next-auth/react';
import { ShinyModeProvider } from './ShinyModeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ShinyModeProvider>
            {children}
          </ShinyModeProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
