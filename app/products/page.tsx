import { getProducts } from '@/actions/product.actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ProductModal } from '@/components/features/products/ProductModal'
import { ProductDeleteConfirmation } from '@/components/features/products/ProductDeleteConfirmation'
import { XeroProvider } from '@/components/features/xero/XeroProvider'
import { ProductsTable } from '@/components/features/products/ProductsTable'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <XeroProvider>
      <div className='container mx-auto py-10'>
        <div className='flex justify-between items-center mb-5'>
          <ProductsTable products={products} />
        </div>
      </div>
    </XeroProvider>
  )

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-5'>
        <h1 className='text-2xl font-bold'>Products</h1>
        <ProductModal />
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
                  <ProductModal product={product} />
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
