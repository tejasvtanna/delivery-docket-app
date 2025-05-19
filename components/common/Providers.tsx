'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from '@clerk/nextjs'

// Create QueryClient once, outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Cache forever by default
      retry: 2 // Retry failed requests twice
    }
  }
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position='top-center' expand={true} />
          <ReactQueryDevtools
            initialIsOpen={false}
            position='bottom'
            buttonPosition='bottom-left'
          />
        </QueryClientProvider>
      </TooltipProvider>
    </ClerkProvider>
  )
}
