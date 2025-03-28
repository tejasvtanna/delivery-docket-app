'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-center text-gray-900'>
          Something went wrong!
        </h2>
        <p className='text-center text-gray-600'>
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className='flex justify-center'>
          <button
            onClick={() => reset()}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
