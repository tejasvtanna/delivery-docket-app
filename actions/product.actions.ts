'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Product, ProductPrice } from '@prisma/client'
import { ProductFormData } from '@/schemas/product.schemas' // Updated import

export async function getProducts(): Promise<
  (Product & { prices: ProductPrice[] })[]
> {
  return await prisma.product.findMany({
    include: { prices: true }
  })
}

export async function createProduct(data: ProductFormData) {
  const { name, basePrice, prices } = data

  const product = await prisma.product.create({
    data: {
      name,
      basePrice: basePrice ?? null,
      prices: {
        create: Object.entries(prices)
          .filter(([, price]) => price !== undefined)
          .map(([customerId, price]) => ({
            customerId,
            price: price!
          }))
      }
    }
  })

  revalidatePath('/products')
  return product
}

export async function updateProduct(id: number, data: ProductFormData) {
  const { name, basePrice, prices } = data

  await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { name, basePrice: basePrice ?? null }
    }),
    prisma.productPrice.deleteMany({ where: { productId: id } }),
    prisma.productPrice.createMany({
      data: Object.entries(prices)
        .filter(([, price]) => price !== undefined)
        .map(([customerId, price]) => ({
          productId: id,
          customerId,
          price: price!
        }))
    })
  ])

  revalidatePath('/products')
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/products')
}
