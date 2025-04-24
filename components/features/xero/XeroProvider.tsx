'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchXeroCustomers } from '@/actions/customer.actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function XeroProvider({ children }: Props) {
  const {
    data: customers,
    error,
    isLoading
  } = useQuery({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers,
    enabled: true,
    retry: 0 // Don’t retry (let token error show login)
    // staleTime: Infinity, // Cache forever unless invalidated
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p>Loading Xero customers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen flex-col gap-4'>
        {/* <p>Failed to load Xero customers: {error.message}</p> */}
        <p>Please authenticate with Xero</p>
        <Button asChild>
          <Link href='/api/xero-auth'>Connect to Xero</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* <p className='fixed bottom-0 right-4'>
        Total # of customers: {customers?.length}
      </p> */}
      {children}
    </>
  )
}
