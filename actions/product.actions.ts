'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Product, ProductPrice } from '@prisma/client'
import { ProductFormData } from '@/schemas/product.schemas'

export async function getProducts(): Promise<
  (Product & { prices: ProductPrice[] })[]
> {
  return await prisma.product.findMany({
    include: { prices: true }
  })
}

export async function createProduct(data: Omit<ProductFormData, 'prices'>) {
  const { name, basePrice } = data

  const product = await prisma.product.create({
    data: {
      name,
      basePrice: basePrice ?? null
    }
  })

  revalidatePath('/products')
  return product
}

export async function updateProduct(id: number, data: ProductFormData) {
  const product = prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      basePrice: data.basePrice,
      prices: {
        update: Object.entries(data.prices || {}).map(
          ([customerId, price]) => ({
            where: { productId_customerId: { productId: id, customerId } },
            data: { price }
          })
        )
      }
    }
  })

  revalidatePath('/products')
  return product
}

// export async function addPriceOverride(
//   productId: number,
//   customerId: string,
//   price: number
// ) {
//   const overridePrice = await prisma.productPrice.create({
//     data: {
//       productId,
//       customerId,
//       price
//     }
//   })

//   revalidatePath('/products')
//   return overridePrice
// }

export async function addPriceOverride(
  productId: number,
  customerId: string,
  price: number
) {
  const overridePrice = await prisma.productPrice.upsert({
    where: {
      productId_customerId: { productId, customerId } // Composite unique key
    },
    update: {
      price // Update price if exists
    },
    create: {
      productId,
      customerId,
      price
    }
  })
  revalidatePath('/products')
  revalidatePath('/dockets')
  return overridePrice
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('deleteProduct error', error)
    throw error
  }
}

export async function getProductPrices(
  productId: number
): Promise<ProductPrice[]> {
  return prisma.productPrice.findMany({
    where: { productId }
  })
}
