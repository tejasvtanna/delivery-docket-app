'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createDocket } from '@/actions/docket.actions'
import { fetchXeroCustomers } from '@/actions/customer.actions'
import { getProducts } from '@/actions/product.actions'
import { docketSchema, DocketFormData } from '@/schemas/docket.schema'
import { XeroCustomer } from '@/actions/customer.actions'
import { Product, ProductPrice } from '@prisma/client'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PriceOverrideModal } from '@/components/features/products/PriceOverrideModal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  onClose: () => void
}

export function DocketModal({ onClose }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isOverrideOpen, setIsOverrideOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  )
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  )

  // Fetch customers and products
  const { data: allCustomers = [] } = useQuery<XeroCustomer[]>({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })
  const { data: products = [] } = useQuery<
    (Product & { prices: ProductPrice[] })[]
  >({
    queryKey: ['products'],
    queryFn: getProducts
  })

  const form = useForm<DocketFormData>({
    resolver: zodResolver(docketSchema),
    defaultValues: {
      date: new Date(),
      driverRegNumber: '',
      customerId: '',
      productId: 0,
      orderNumber: '',
      deliveryAddress: '',
      inspectedBy: '',
      deliveredBy: '',
      firstWeight: 0,
      secondWeight: 0,
      thirdWeight: 0,
      receivedBy: '',
      price: 0
    }
  })

  // Get selected product and override price
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const overridePrice = selectedProduct?.prices.find(
    (price) => price.customerId === selectedCustomerId
  )?.price

  const onSubmit = (data: DocketFormData) => {
    startTransition(async () => {
      try {
        const priceToSave = overridePrice ?? selectedProduct?.basePrice ?? 0
        const docketData = { ...data, price: priceToSave }
        await createDocket(docketData)
        toast('Docket created')
        onClose()
        form.reset()
      } catch (error) {
        toast('Failed to create docket')
      }
    })
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => !open && onClose()}
      aria-describedby=''
    >
      <DialogContent
        aria-describedby={undefined}
        className='max-h-[87%] overflow-y-auto'
      >
        <DialogHeader>
          <DialogTitle>Add Docket</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                name='date'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Date</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        value={field.value.toISOString().split('T')[0]}
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='driverRegNumber'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Driver's Reg Number
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='customerId'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Customer</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedCustomerId(value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a customer' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allCustomers.map((customer) => (
                          <SelectItem
                            key={customer.contactID}
                            value={customer.contactID}
                          >
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='productId'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Product</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value))
                        setSelectedProductId(parseInt(value))
                      }}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a product' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-between items-center col-span-2'>
                <div>
                  <p>
                    Base Price:{' '}
                    {selectedProduct?.basePrice
                      ? `$${selectedProduct.basePrice.toFixed(2)}`
                      : 'N/A'}
                  </p>
                  <p
                    className={cn(
                      overridePrice ? 'text-green-700' : 'text-red-700'
                    )}
                  >
                    Override Price:{' '}
                    {overridePrice !== undefined
                      ? `$${overridePrice.toFixed(2)}`
                      : 'N/A'}
                  </p>
                </div>
                {selectedProductId && selectedCustomerId && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsOverrideOpen(true)}
                  >
                    {overridePrice !== undefined
                      ? 'Edit Override'
                      : 'Add Override'}
                  </Button>
                )}
              </div>

              <FormField
                name='orderNumber'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Order Number
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='inspectedBy'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Inspected By
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='deliveredBy'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Delivered By
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='firstWeight'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>1st Weight</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='secondWeight'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>2nd Weight</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='thirdWeight'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>3rd Weight</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='receivedBy'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Received By</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='deliveryAddress'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>
                      Delivery Address
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      {selectedProductId && selectedCustomerId && isOverrideOpen && (
        <PriceOverrideModal
          isOpen={isOverrideOpen}
          onOpenChange={setIsOverrideOpen}
          productId={selectedProductId}
          productName={selectedProduct!.name}
          customers={allCustomers}
          customerId={selectedCustomerId}
          overridePrice={overridePrice}
          mode={overridePrice !== undefined ? 'edit' : 'add'}
        />
      )}
    </Dialog>
  )
}
