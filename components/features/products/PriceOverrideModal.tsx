'use client'

import { useState, useTransition } from 'react'
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
import { useQueryClient } from '@tanstack/react-query'

interface PriceOverrideModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  productName: string
  customers: XeroCustomer[]
  customerId?: string
  overridePrice?: number
  mode: 'add' | 'edit'
}

export const PriceOverrideModal: React.FC<PriceOverrideModalProps> = ({
  isOpen,
  onOpenChange,
  productId,
  productName,
  customers,
  customerId,
  overridePrice,
  mode
}) => {
  const queryClient = useQueryClient()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customerId || ''
  )
  const [price, setPrice] = useState<string>(overridePrice?.toString() || '')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (selectedCustomerId && price) {
      startTransition(async () => {
        try {
          await addPriceOverride(
            productId,
            selectedCustomerId,
            parseFloat(price)
          )
          queryClient.invalidateQueries({
            queryKey: ['override-prices']
          })
          toast('Price override saved')
          setSelectedCustomerId('')
          setPrice('')
          onOpenChange(false)
        } catch (error) {
          toast('Failed to save price override')
        }
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add' : 'Edit'} Price Override
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            Product: <b>{productName}</b>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Customer
            </label>
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
              disabled={!!customerId} // Disabled if customerId is passed
            >
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
              disabled={!selectedCustomerId || !price || isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
