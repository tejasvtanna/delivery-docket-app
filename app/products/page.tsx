import { getProducts, deleteProduct } from '@/actions/product.actions'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Trash } from 'lucide-react' // Icons (npm install lucide-react)
import { ProductEditForm } from '@/components/features/products/ProductEditForm'

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
                  <form
                    action={async () => {
                      'use server'
                      await deleteProduct(product.id)
                    }}
                  >
                    <Button variant='ghost' size='icon' type='submit'>
                      <Trash className='h-4 w-4' />
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
