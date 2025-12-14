'use server'

import { Docket, Product } from '@prisma/client'
import xero, { xeroInit } from '@/lib/xeroClient'
import { Invoice } from 'xero-node'
import { LineAmountTypes } from 'xero-node'
import prisma from '@/lib/prisma'
import { DocketStatus } from '@/types/docket.types'
import { revalidatePath } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function createXeroInvoice(
  selectedDockets: (Docket & { product: Product })[]
) {
  const tokenSet = await xeroInit()
  if (!tokenSet.tenantId) {
    throw new Error('Xero tenant ID not found in token set')
  }

  // Get the authenticated user's details from Clerk
  const { userId } = await auth()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress || 'unknown'
  const firstName = user?.firstName || ''
  const lastName = user?.lastName || ''

  // Format invoiceGeneratedBy: "firstName lastName (email)" or just "email" if names are missing
  const invoiceGeneratedBy =
    firstName || lastName ? `${firstName} ${lastName} (${email})`.trim() : email

  const invoiceData: Partial<Invoice> = {
    type: Invoice.TypeEnum.ACCREC,
    contact: {
      contactID: selectedDockets[0].customerId
    },
    lineItems: selectedDockets.map((docket) => ({
      description: `${docket.product.name} (Docket #${docket.docketNumber} Delivery Date: ${docket.date.toLocaleDateString('en-IE')})`,
      quantity: docket.weight ?? 1,
      unitAmount: docket.price,
      accountCode: '10' // Updated to client-specified default
      // taxType: 'OUTPUT' // Assumes 'OUTPUT' is the TaxType for "VAT on Sales (23%)"
    })),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days from now
    lineAmountTypes: LineAmountTypes.Exclusive,
    status: Invoice.StatusEnum.DRAFT
    // invoiceNumber: `INV-${Date.now()}` // Auto-generated unique invoice number
  }

  const response = await xero.accountingApi.createInvoices(tokenSet.tenantId, {
    invoices: [invoiceData as Invoice]
  })

  if (response.body.invoices && response.body.invoices.length > 0) {
    console.log('Invoice created:', response.body.invoices[0].invoiceID)
    // Update docket statuses to InvoiceGenerated
    await Promise.all(
      selectedDockets.map((docket) =>
        prisma.docket.update({
          where: { id: docket.id },
          data: {
            status: DocketStatus.InvoiceGenerated,
            invoiceGeneratedOn: new Date(),
            invoiceGeneratedBy
          }
        })
      )
    )
    revalidatePath('/dockets')
    return { success: true, invoiceId: response.body.invoices[0].invoiceID }
  } else {
    throw new Error('Invoice creation failed')
  }
}
