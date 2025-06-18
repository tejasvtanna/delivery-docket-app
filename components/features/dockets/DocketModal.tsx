'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createDocket, updateDocket } from '@/actions/docket.actions'
import { fetchXeroCustomers } from '@/actions/customer.actions'
import { getProducts, getAllOverridePrices } from '@/actions/product.actions'
import { docketSchema, DocketFormData } from '@/schemas/docket.schema'
import { XeroCustomer } from '@/actions/customer.actions'
import { Product, ProductPrice, Docket } from '@prisma/client'
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
import { Textarea } from '@/components/ui/textarea'
import { PriceOverrideModal } from '@/components/features/products/PriceOverrideModal'
import { Dropdown } from '@/components/common/Dropdown'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

interface Props {
  onClose: () => void
  docket?: Docket & { product: Product }
}

export function DocketModal({ onClose, docket }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isOverrideOpen, setIsOverrideOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    docket?.product ?? null
  )
  const [selectedCustomer, setSelectedCustomer] = useState<XeroCustomer | null>(
    null
  )

  // Fetch customers and products
  const { data: allCustomers = [] } = useQuery<XeroCustomer[]>({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts
  })

  // Fetch override prices
  const { data: overridePrices = [], isLoading: isLoadingOverridePrices } =
    useQuery<ProductPrice[]>({
      queryKey: ['override-prices'],
      queryFn: getAllOverridePrices
      // initialData: docket?.product.prices ?? [] // Fallback if included in props
    })

  const form = useForm<DocketFormData>({
    resolver: zodResolver(docketSchema),
    defaultValues: docket
      ? {
          date: new Date(docket.date),
          driverRegNumber: docket.driverRegNumber ?? '',
          customerId: docket.customerId,
          productId: docket.productId,
          orderNumber: docket.orderNumber,
          deliveryAddress: docket.deliveryAddress ?? '',
          inspectedBy: docket.inspectedBy ?? '',
          deliveredBy: docket.deliveredBy ?? '',
          weight: docket.weight ?? 0,
          receivedBy: docket.receivedBy ?? '',
          price: docket.price
        }
      : {
          date: new Date(),
          driverRegNumber: '',
          customerId: '',
          productId: 0,
          orderNumber: '',
          deliveryAddress: '',
          inspectedBy: '',
          deliveredBy: '',
          weight: 0,
          receivedBy: '',
          price: 0
        }
  })

  useEffect(() => {
    if (!docket) return

    const initialCustomer = allCustomers.find(
      (c) => c.contactID === docket.customerId
    )
    if (initialCustomer) setSelectedCustomer(initialCustomer)
  }, [docket, allCustomers])

  // Find override price based on selected customer and product
  const overridePrice = overridePrices.find(
    (price) =>
      price.customerId === selectedCustomer?.contactID &&
      price.productId === selectedProduct?.id
  )?.price

  const onSubmit = (data: DocketFormData) => {
    startTransition(async () => {
      try {
        const priceToSave = overridePrice ?? selectedProduct?.basePrice ?? 0
        const docketData = {
          ...data,
          price: priceToSave
        }
        if (docket) {
          await updateDocket(docket.id, docketData)
          toast('Docket updated')
        } else {
          await createDocket(docketData)
          toast('Docket created')
        }
        onClose()
        form.reset()
      } catch (error) {
        toast(`Failed to ${docket ? 'update' : 'create'} docket`)
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
          <DialogTitle>{docket ? 'Edit Docket' : 'Add Docket'}</DialogTitle>
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
              <div />
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
                  <FormItem className='col-span-2'>
                    <FormLabel className='text-gray-700'>Customer</FormLabel>
                    <FormControl>
                      <Dropdown
                        placeholder='Select a customer'
                        options={allCustomers}
                        value={selectedCustomer}
                        onChange={(val) => {
                          const customer = val as XeroCustomer | null
                          setSelectedCustomer(customer)
                          field.onChange(customer?.contactID ?? '')
                        }}
                        valuePropName='contactID'
                        labelPropName='name'
                        multiSelect={false}
                        className='w-full bg-white shadow-sm text-gray-900'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='productId'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel className='text-gray-700'>Product</FormLabel>
                    <FormControl>
                      <Dropdown
                        placeholder='Select a product'
                        options={products}
                        value={selectedProduct}
                        onChange={(val) => {
                          const product = val as Product | null
                          setSelectedProduct(product)
                          field.onChange(product?.id ?? 0)
                        }}
                        valuePropName='id'
                        labelPropName='name'
                        multiSelect={false}
                        className='w-full bg-white shadow-sm text-gray-900'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-between items-center col-span-2'>
                <div>
                  <div>
                    Base Price:{' '}
                    {selectedProduct?.basePrice
                      ? `€${selectedProduct.basePrice.toFixed(2)}`
                      : 'N/A'}
                  </div>
                  <div
                    className={cn(
                      overridePrice ? 'text-green-700' : 'text-red-700'
                    )}
                  >
                    <div className='flex gap-2 items-center'>
                      Override Price:{' '}
                      {isLoadingOverridePrices ? (
                        <LoaderCircle className='animate-spin h-4 w-4' />
                      ) : overridePrice !== undefined ? (
                        `€${overridePrice.toFixed(2)}`
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>
                </div>
                {selectedProduct && selectedCustomer && (
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
                name='weight'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700'>Weight (KG)</FormLabel>
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
      {selectedProduct && selectedCustomer && isOverrideOpen && (
        <PriceOverrideModal
          isOpen={isOverrideOpen}
          onOpenChange={setIsOverrideOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          customers={allCustomers}
          customerId={selectedCustomer.contactID}
          overridePrice={overridePrice}
          mode={overridePrice !== undefined ? 'edit' : 'add'}
        />
      )}
    </Dialog>
  )
}
