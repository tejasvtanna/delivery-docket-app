'use server'

import { Docket, Product } from '@prisma/client'
import xero, { getTokenSet } from '@/lib/xeroClient'
import { Invoice } from 'xero-node'
import { LineAmountTypes } from 'xero-node'

export async function createXeroInvoice(
  selectedDockets: (Docket & { product: Product })[]
) {
  const tokenSet = await getTokenSet()
  if (!tokenSet.tenantId) {
    throw new Error('Xero tenant ID not found in token set')
  }

  const invoiceData: Partial<Invoice> = {
    type: Invoice.TypeEnum.ACCREC,
    contact: {
      contactID: selectedDockets[0].customerId // Simplified; adjust for multiple customers
    },
    lineItems: selectedDockets.map((docket) => ({
      description: `${docket.product.name} (Docket #${docket.docketNumber})`,
      quantity: docket.firstWeight ?? 1,
      unitAmount: docket.price,
      accountCode: '200' // Replace with your default revenue account code
    })),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days from now
    lineAmountTypes: LineAmountTypes.Exclusive,
    status: Invoice.StatusEnum.DRAFT,
    invoiceNumber: `INV-${Date.now()}` // Auto-generated unique invoice number
  }

  const response = await xero.accountingApi.createInvoices(tokenSet.tenantId, {
    invoices: [invoiceData as Invoice]
  })

  if (response.body.invoices && response.body.invoices.length > 0) {
    console.log('Invoice created:', response.body.invoices[0].invoiceID)
    return { success: true, invoiceId: response.body.invoices[0].invoiceID }
  } else {
    throw new Error('Invoice creation failed')
  }
}
