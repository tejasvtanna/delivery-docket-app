'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 5 * 60 * 1000, // 5 minutes cache
      retry: 2 // Retry failed requests twice
    }
  }
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} /> {/* Optional */}
      </QueryClientProvider>
    </TooltipProvider>
  )
}
