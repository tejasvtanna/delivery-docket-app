'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Product, ProductPrice } from '@prisma/client'
import { ProductModal } from './ProductModal'
import { ProductDeleteConfirmation } from './ProductDeleteConfirmation'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@radix-ui/react-tooltip'

interface Props {
  products: (Product & { prices: ProductPrice[] })[]
}

export function ProductsTable({ products }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingProduct, setEditingProduct] = useState<
    (Product & { prices: ProductPrice[] }) | null
  >(null)

  // console.debug({ isAdding, editingProduct })

  return (
    <>
      <div className='w-full'>
        <div className='flex justify-between items-center mb-5'>
          <h1 className='text-2xl font-bold'>Products</h1>
          <Button onClick={() => setIsAdding(true)}>Add Product</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50%]'>Product Name</TableHead>
              <TableHead className='w-[45%]'>Base Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  {product.basePrice ? `$${product.basePrice}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='right'>
                        Edit product or override prices
                      </TooltipContent>
                    </Tooltip>
                    <ProductDeleteConfirmation product={product} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Product Modal */}
      {isAdding && <ProductModal onClose={() => setIsAdding(false)} />}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  )
}
