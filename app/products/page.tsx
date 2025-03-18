import { getProducts } from '@/actions/product.actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ProductEditForm } from '@/components/features/products/ProductEditForm'
import { ProductDeleteConfirmation } from '@/components/features/products/ProductDeleteConfirmation'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-5'>
        <h1 className='text-2xl font-bold'>Products</h1>
        <ProductEditForm />
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
                  <ProductEditForm product={product} />
                  <ProductDeleteConfirmation product={product} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
