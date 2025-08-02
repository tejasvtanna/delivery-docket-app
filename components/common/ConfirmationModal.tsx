'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { ButtonProps } from '@/components/ui/button'

// Main component
interface Props {
  open?: boolean
  title: string
  description?: string
  icon?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  primaryButton: React.ReactElement<ButtonProps>
  secondaryButton?: React.ReactElement<ButtonProps>
}

export const ConfirmationModal = ({
  open,
  title,
  description,
  icon,
  onOpenChange,
  primaryButton,
  secondaryButton
}: Props) => {
  if (!open) return null

  const clonedPrimaryButton = React.cloneElement(primaryButton, {
    variant: 'default',
    size: 'lg'
  })

  const clonedSecondaryButton = secondaryButton
    ? React.cloneElement(secondaryButton, { variant: 'secondary', size: 'lg' })
    : null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='p-6 w-[400px] max-w-[400px] bg-white'>
        <div id='cm-header'>
          {icon && <div className='mb-5 h-12 w-12'>{icon}</div>}

          <AlertDialogTitle>
            <div className='text-2xl font-semibold'>{title}</div>
          </AlertDialogTitle>

          {description && (
            <AlertDialogDescription>
              <div className='text-base text-grey-2'>{description}</div>
            </AlertDialogDescription>
          )}
        </div>

        <AlertDialogFooter>
          <div className='flex gap-3 justify-end w-full mt-4'>
            {clonedSecondaryButton && (
              <div className='flex-1'>
                {React.cloneElement(clonedSecondaryButton, {
                  className: 'w-full'
                })}
              </div>
            )}
            <div className='flex-1'>
              {React.cloneElement(clonedPrimaryButton, { className: 'w-full' })}
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
