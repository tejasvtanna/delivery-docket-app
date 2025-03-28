import React from 'react'

interface SpinnerProps {
  size: 'small' | 'medium' | 'large'
}

export const Spinner: React.FC<SpinnerProps> = ({ size }) => {
  const sizeMap = {
    small: 14,
    medium: 24,
    large: 32
  }

  const spinnerSize = sizeMap[size]

  return (
    <svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='animate-spin'
    >
      <circle
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
        strokeDasharray='50 100'
        strokeDashoffset='0'
      >
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .animate-spin {
              animation: spin 1s linear infinite;
            }
          `}
        </style>
      </circle>
    </svg>
  )
}
