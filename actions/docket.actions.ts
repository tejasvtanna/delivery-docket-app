'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Docket, Product } from '@prisma/client'
import { docketSchema, DocketFormData } from '@/schemas/docket.schema'

// Get all dockets
export async function getDockets(): Promise<(Docket & { product: Product })[]> {
  return await prisma.docket.findMany({
    include: {
      product: true // Include related Product data
    },
    orderBy: {
      date: 'desc' // Latest first
    }
  })
}

// Get a single docket by ID
export async function getDocket(id: number): Promise<Docket | null> {
  return await prisma.docket.findUnique({
    where: { id },
    include: {
      product: true
    }
  })
}

// Create a new docket
export async function createDocket(data: DocketFormData) {
  // Validate input
  const validatedData = docketSchema.parse(data)

  const docket = await prisma.docket.create({
    data: {
      date: validatedData.date,
      driverRegNumber: validatedData.driverRegNumber ?? null,
      customerId: validatedData.customerId,
      productId: validatedData.productId,
      orderNumber: validatedData.orderNumber,
      // docketNumber: validatedData.docketNumber,
      deliveryAddress: validatedData.deliveryAddress ?? null,
      inspectedBy: validatedData.inspectedBy ?? null,
      deliveredBy: validatedData.deliveredBy ?? null,
      firstWeight: validatedData.firstWeight ?? null,
      secondWeight: validatedData.secondWeight ?? null,
      thirdWeight: validatedData.thirdWeight ?? null,
      receivedBy: validatedData.receivedBy ?? null,
      price: validatedData.price, // Required
      status: 1
      // createdAt and updatedAt are set by Prisma defaults
    }
  })
  revalidatePath('/dockets')
  return docket
}

// Update an existing docket
export async function updateDocket(id: number, data: DocketFormData) {
  // Validate input
  const validatedData = docketSchema.parse(data)

  const docket = await prisma.docket.update({
    where: { id },
    data: {
      date: validatedData.date,
      driverRegNumber: validatedData.driverRegNumber ?? null,
      customerId: validatedData.customerId,
      productId: validatedData.productId,
      orderNumber: validatedData.orderNumber,
      // docketNumber: validatedData.docketNumber,
      deliveryAddress: validatedData.deliveryAddress ?? null,
      inspectedBy: validatedData.inspectedBy ?? null,
      deliveredBy: validatedData.deliveredBy ?? null,
      firstWeight: validatedData.firstWeight ?? null,
      secondWeight: validatedData.secondWeight ?? null,
      thirdWeight: validatedData.thirdWeight ?? null,
      receivedBy: validatedData.receivedBy ?? null,
      price: validatedData.price, // Required
      status: validatedData.status // Required
      // updatedAt is auto-updated by Prisma
    }
  })
  revalidatePath('/dockets')
  return docket
}

// Delete a docket
export async function deleteDocket(id: number) {
  try {
    await prisma.docket.delete({ where: { id } })
    revalidatePath('/dockets')
    return { success: true }
  } catch (error) {
    console.error('deleteDocket error', error)
    throw error
  }
}
