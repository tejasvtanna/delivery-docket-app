'use client'

import { useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  createProduct,
  getProductPrices,
  updateProduct
} from '@/actions/product.actions'
import { XeroCustomer, fetchXeroCustomers } from '@/actions/customer.actions'
import { productSchema, ProductFormData } from '@/schemas/product.schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Product, ProductPrice } from '@prisma/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { PriceOverrideModal } from './PriceOverrideModal'
import { Spinner } from '@/components/common/Spinner'

interface Props {
  product?: Product
  onClose?: () => void
}

export const ProductModal: React.FC<Props> = ({ product, onClose }) => {
  const [isOverrideOpen, setIsOverrideOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { data: allCustomers = [] } = useQuery<XeroCustomer[]>({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })

  const { data: prices = [], isLoading: isLoadingPrices } = useQuery<
    ProductPrice[]
  >({
    queryKey: ['product-prices', product?.id],
    queryFn: () => getProductPrices(product!.id),
    enabled: !!product?.id
    // initialData: product?.prices // Use prop as initial data
  })

  const overrideCustomers = product
    ? allCustomers.filter((customer) =>
        prices.some((price) => price.customerId === customer.contactID)
      )
    : []

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      basePrice: product?.basePrice ?? undefined,
      prices: product
        ? Object.fromEntries(prices.map((p) => [p.customerId, p.price]))
        : {}
    }
  })

  const onSubmit = (data: ProductFormData) => {
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, data)
          toast('Product updated')
        } else {
          await createProduct(data)
          toast('Product added')
        }
        onClose?.()
        form.reset()
      } catch (error) {
        toast('Failed to save product')
      }
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose?.()
  }

  useEffect(() => {
    if (!product) return

    const updatedPrices = Object.fromEntries(
      prices.map((p) => [p.customerId, p.price])
    )
    form.setValue('prices', updatedPrices)
  }, [product, prices])

  // console.debug({ product })
  // console.debug({ watch: form.watch() })

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Edit the product details & override prices'
              : 'Add a new product'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Product Name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='basePrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {product && (
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='text-lg font-medium'>Price Overrides</h3>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsOverrideOpen(true)}
                  >
                    <Plus className='h-4 w-4 mr-1' /> Add Override
                  </Button>
                </div>
                {isLoadingPrices ? (
                  <div className='flex items-center justify-center my-5'>
                    <Spinner size='medium' />
                  </div>
                ) : overrideCustomers.length > 0 ? (
                  <div className='max-h-[300px] overflow-y-auto'>
                    <Table>
                      <TableBody>
                        {overrideCustomers.map((customer) => (
                          <TableRow key={customer.contactID}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`prices.${customer.contactID}`}
                                render={({ field }) => (
                                  <FormControl>
                                    <Input
                                      type='number'
                                      step='0.01'
                                      value={field.value ?? ''}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value
                                            ? parseFloat(e.target.value)
                                            : undefined
                                        )
                                      }
                                    />
                                  </FormControl>
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No prices overrides added yet.
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {product && (
        <PriceOverrideModal
          isOpen={isOverrideOpen}
          onOpenChange={setIsOverrideOpen}
          productId={product.id}
          customers={allCustomers.filter(
            (c) => !prices.some((p) => p.customerId === c.contactID)
          )}
        />
      )}
    </Dialog>
  )
}
