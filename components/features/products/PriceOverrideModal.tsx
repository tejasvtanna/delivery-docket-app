'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addPriceOverride } from '@/actions/product.actions'
import { XeroCustomer } from '@/actions/customer.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'

interface PriceOverrideModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  customers: XeroCustomer[]
}

export const PriceOverrideModal = ({
  isOpen,
  onOpenChange,
  productId,
  customers
}: PriceOverrideModalProps) => {
  const [customerId, setCustomerId] = useState<string>('')
  const [price, setPrice] = useState<string>('')

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      customerId,
      price
    }: {
      customerId: string
      price: number
    }) => addPriceOverride(productId, customerId, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-prices', productId] })
      toast('Price override added')
      setCustomerId('')
      setPrice('')
      onOpenChange(false)
    },
    onError: () => {
      toast('Failed to add price override')
    }
  })

  const handleSave = () => {
    if (customerId && price) {
      mutation.mutate({ customerId, price: parseFloat(price) })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Price Override</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Customer
            </label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder='Select a customer' />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.contactID}
                    value={customer.contactID}
                  >
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Override Price
            </label>
            <Input
              type='number'
              step='0.01'
              placeholder='0.00'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSave}
              disabled={!customerId || !price || mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Override'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
