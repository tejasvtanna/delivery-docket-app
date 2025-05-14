import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getProductsWithPrices } from '@/actions/product.actions'
import { XeroProvider } from '@/components/features/xero/XeroProvider'
import { ProductsTable } from '@/components/features/products/ProductsTable'

export default async function ProductsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/login')
  }

  const products = await getProductsWithPrices()

  return (
    <XeroProvider>
      <ProductsTable products={products} />
    </XeroProvider>
  )
}
