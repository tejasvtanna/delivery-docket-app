'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createProduct, updateProduct } from '@/actions/product.actions'
import { fetchXeroCustomers, XeroCustomer } from '@/lib/xeroApi'
import { productSchema, ProductFormData } from '@/schemas/product.schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
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
import { Pencil } from 'lucide-react'

interface ProductEditFormProps {
  product?: Product & { prices: ProductPrice[] }
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Fetch Xero customers with React Query
  const {
    data: customers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      basePrice: product?.basePrice ?? undefined,
      prices: product
        ? Object.fromEntries(product.prices.map((p) => [p.customerId, p.price]))
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
        setIsOpen(false)
        form.reset()
      } catch (error) {
        toast('Failed to save product')
      }
    })
  }

  if (error) {
    toast('Failed to load customers from Xero')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={product ? 'ghost' : 'default'}
          size={product ? 'icon' : 'default'}
          disabled={isLoading || !!error}
        >
          {product ? <Pencil className='h-4 w-4' /> : 'Add Product'}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            {product ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Edit product details along with price for each customer'
              : 'Add a new product along with prices for each customer'}
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
                      step='1'
                      // placeholder='0.00'
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
            <div>
              <h3 className='text-lg font-medium mb-2'>Customer Prices</h3>
              <Table>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`prices.${customer.id}`}
                          render={({ field }) => (
                            <FormControl>
                              <Input
                                type='number'
                                step='0.01'
                                // placeholder={
                                //   form.getValues('basePrice')?.toString() ||
                                //   '0.00'
                                // }
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

            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
