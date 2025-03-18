'use server'

import xero, { getTokenSet } from '@/lib/xeroClient'

// Interface for Xero Contact (simplified, with any for now)
export interface XeroCustomer {
  contactID: string
  name: string
  emailAddress?: string
  contactStatus: any // Using any as per your current choice
  isCustomer: boolean
}

export async function fetchXeroCustomers(): Promise<XeroCustomer[]> {
  try {
    const tokenSet = await getTokenSet()
    const tenantId = tokenSet.tenantId

    const ifModifiedSince: Date = new Date('2020-02-06T12:17:43.202-08:00')
    const where = 'ContactStatus=="ACTIVE"'
    // const where = 'IsCustomer==true'
    const order = 'Name ASC'
    const iDs = ['00000000-0000-0000-0000-000000000000']
    const page = 1
    const includeArchived = false
    const summaryOnly = true
    const searchTerm = '' //'Joe Bloggs'
    const pageSize = 100

    const response = await xero.accountingApi.getContacts(
      tenantId,
      undefined, // ifModifiedSince
      where,
      order,
      [], // IDs
      page,
      includeArchived,
      summaryOnly,
      searchTerm,
      pageSize
    )

    const customers =
      response.body.contacts?.map((contact) => ({
        contactID: contact.contactID!,
        name: contact.name!,
        emailAddress: contact.emailAddress || 'N/A',
        contactStatus: contact.contactStatus!, // Typed as any
        isCustomer: contact.isCustomer || true
      })) || []

    console.debug({ customers })

    return customers
  } catch (error: any) {
    console.error('Xero Fetch Error:', error)
    if (error?.response?.status === 401) {
      throw new Error('Unauthorized - please reconnect to Xero')
    }
    throw new Error('Failed to fetch customers from Xero')
  }
}
