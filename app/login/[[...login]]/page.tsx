'use client'

import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className='flex items-center justify-center h-auto'>
      <SignIn
        routing='path'
        path='/login'
        appearance={{
          elements: {
            footerAction: { display: 'none' } // Hides the "Sign up" link
          }
        }}
      />
    </div>
  )
}
