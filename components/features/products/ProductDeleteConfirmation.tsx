'use client'

import React, { useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
import { Product } from '@prisma/client'
import { deleteProduct } from '@/actions/product.actions'
import { toast } from 'sonner'
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  product: Product
}

export function ProductDeleteConfirmation({ product }: Props) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDeleteProduct = () => {
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      setIsOpen(false)
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label={`Delete product ${product.name}`}
        >
          <Trash className='h-4 w-4' />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Product delete confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the product {product.name} and prices
            associated with it
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleDeleteProduct}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
