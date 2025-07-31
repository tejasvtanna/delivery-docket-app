'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Docket, DocketNumberType, Prisma, Product } from '@prisma/client'
import { docketSchema, DocketFormData } from '@/schemas/docket.schema'
import { DocketStatus } from '@/types/docket.types'

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

export async function createDocket(data: DocketFormData) {
  // Validate input
  const validatedData = docketSchema.parse(data)

  let docketNumber: string
  const docketNumberType: DocketNumberType = validatedData.isDocketNumberAuto
    ? 'auto'
    : 'manual'

  if (validatedData.isDocketNumberAuto) {
    // Perform the MAX calculation directly in the database for efficiency.
    const result: { max: number | null }[] = await prisma.$queryRaw(
      Prisma.sql`SELECT MAX(CAST("docketNumber" AS INTEGER)) as max FROM "Docket" WHERE "docketNumber" ~ '^[0-9]+$'`
    )
    const maxNumber = result[0]?.max ?? 0
    docketNumber = (maxNumber + 1).toString()
  } else {
    // Logic for handling manual docket number
    docketNumber = validatedData.docketNumber!

    const existingDocket = await prisma.docket.findUnique({
      where: { docketNumber }
    })

    if (existingDocket) {
      throw new Error('This docket number is already in use.')
    }
  }

  const docket = await prisma.docket.create({
    data: {
      date: validatedData.date,
      driverRegNumber: validatedData.driverRegNumber ?? null,
      customerId: validatedData.customerId,
      productId: validatedData.productId,
      orderNumber: validatedData.orderNumber,
      deliveryAddress: validatedData.deliveryAddress ?? null,
      inspectedBy: validatedData.inspectedBy ?? null,
      deliveredBy: validatedData.deliveredBy ?? null,
      weight: validatedData.weight ?? null,
      receivedBy: validatedData.receivedBy ?? null,
      price: validatedData.price,
      status: DocketStatus.Created,
      docketNumber, // Add the generated/validated docket number
      docketNumberType // Add the type
    }
  })
  revalidatePath('/dockets')
  return docket
}

// Update an existing docket
// ... other imports and actions ...

export async function updateDocket(id: number, data: DocketFormData) {
  const validatedData = docketSchema.parse(data)

  const docket = await prisma.docket.update({
    where: { id },
    data: {
      date: validatedData.date,
      driverRegNumber: validatedData.driverRegNumber ?? null,
      customerId: validatedData.customerId,
      productId: validatedData.productId,
      orderNumber: validatedData.orderNumber,
      deliveryAddress: validatedData.deliveryAddress ?? null,
      inspectedBy: validatedData.inspectedBy ?? null,
      deliveredBy: validatedData.deliveredBy ?? null,
      weight: validatedData.weight ?? null,
      receivedBy: validatedData.receivedBy ?? null,
      price: validatedData.price
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
