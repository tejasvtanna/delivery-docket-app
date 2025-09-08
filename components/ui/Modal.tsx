import React, { FC, ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogClose
} from '@/components/ui/dialog'
// import { ReactComponent as XCloseIcon } from '@/assets/icons/x-close.svg'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

//******** Header ********/
interface HeaderProps {
  title: string
  description?: string
  tag?: ReactNode
}

const ModalHeader = ({ title, description, tag }: HeaderProps) => (
  <div id='modal-header' className='px-7 pt-6 pb-4 border-b shrink-0'>
    <div className='flex items-start justify-between gap-2'>
      <div>
        <div className='flex items-center gap-3'>
          <DialogTitle className='text-xl text-grey-1 font-semibold'>
            {title}
          </DialogTitle>
          {tag && <div>{tag}</div>}
        </div>

        {description && (
          <DialogDescription
            id='modal-description'
            className='text-sm text-grey-2'
          >
            {description}
          </DialogDescription>
        )}
      </div>
      <DialogClose asChild>
        <button
          type='button'
          aria-label='Close modal'
          className='relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors duration-200'
        >
          {/* <XCloseIcon className='text-2xl cursor-pointer' /> */}
          {/* <img src='/close.svg' alt='Close Icon' width='20' height='20' /> */}
          <X className='h-6 w-6' />
        </button>
      </DialogClose>
    </div>
  </div>
)

//******** Content ********/
interface ContentProps {
  children: React.ReactNode
  className?: string
}

const ModalContent = ({ children, className }: ContentProps) => (
  <div
    id='modal-content'
    className={cn(
      'flex-1 overflow-y-auto px-8 py-4 max-h-[calc(87vh-200px)]',
      className
    )}
  >
    {children}
  </div>
)

//******** Footer ********/
interface FooterProps {
  primaryButton?: React.ReactElement
  secondaryButton?: React.ReactElement
  tertiaryButton?: React.ReactElement
  children?: React.ReactNode
  className?: string
}

const ModalFooter = ({
  primaryButton,
  secondaryButton,
  tertiaryButton,
  className
}: FooterProps) => {
  //   const clonedPrimaryButton = primaryButton
  //     ? React.cloneElement(primaryButton, { variant: 'default', size: 'xl' })
  //     : null

  //   const clonedSecondaryButton = secondaryButton
  //     ? React.cloneElement(secondaryButton, { variant: 'default', size: 'xl' })
  //     : null

  //   const clonedTertiaryButton = tertiaryButton
  //     ? React.cloneElement(tertiaryButton, { variant: 'default', size: 'xl' })
  //     : null

  return (
    <div
      id='modal-footer'
      className={cn('px-7 py-4 border-t shrink-0', className)}
    >
      <div className='flex justify-between items-center'>
        <div>{tertiaryButton}</div>
        <div className='flex gap-6 justify-end'>
          {secondaryButton}
          {primaryButton}
        </div>
      </div>
    </div>
  )
}

// Define size variants
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom'

interface ModalProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  size?: ModalSize
  customWidth?: string
}

//******** Modal ********/
const ModalRoot = ({
  children,
  open,
  onOpenChange,
  className,
  size = 'md',
  customWidth
}: ModalProps) => {
  const sizeClasses: Record<ModalSize, string> = {
    sm: 'w-[500px] max-w-[500px]',
    md: 'w-[640px] max-w-[640px]',
    lg: 'w-[900px] max-w-[900px]',
    xl: 'w-[1200px] max-w-[1200px]',
    custom: customWidth
      ? `w-[${customWidth}] max-w-[${customWidth}]`
      : 'w-[640px] max-w-[640px]'
  }

  // Check if ModalHeader with a description is present in children
  const hasDescription = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      child.type === ModalHeader &&
      //@ts-ignore
      child.props.description
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex flex-col gap-0 p-0 bg-white max-h-[87vh]',
          sizeClasses[size],
          className
        )}
        aria-describedby={hasDescription ? 'modal-description' : undefined}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Define the Modal type to include sub-components
type ModalComponent = typeof ModalRoot & {
  Header: typeof ModalHeader
  Content: typeof ModalContent
  Footer: typeof ModalFooter
  Close: typeof DialogClose
}

// Create the Modal component with sub-components
const Modal = ModalRoot as ModalComponent
Modal.Header = ModalHeader
Modal.Content = ModalContent
Modal.Footer = ModalFooter
Modal.Close = DialogClose

export { Modal }
