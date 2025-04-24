'use server'

import xero, { xeroInit } from '@/lib/xeroClient'

// Interface for Xero Contact (simplified, with any for now)
export interface XeroCustomer {
  contactID: string
  name: string
  emailAddress?: string
  contactStatus: any // Using any as per your current choice
  isCustomer: boolean | null
}

const ifModifiedSince: Date = new Date('2020-02-06T12:17:43.202-08:00')
const where = 'ContactStatus=="ACTIVE"'
// const where = 'IsCustomer==true'
const order = 'Name ASC'
const iDs: string[] = [] // ['00000000-0000-0000-0000-0000000000001']
const page = 1
const includeArchived = false
const summaryOnly = false
const searchTerm = ''
const pageSize = 100

export async function fetchXeroCustomers(): Promise<XeroCustomer[]> {
  console.debug('Fetching customers...')

  try {
    const tokenSet = await xeroInit()
    const tenantId = tokenSet.tenantId

    const pageSize = 100 // Xero’s max page size
    let page = 1
    let allCustomers: XeroCustomer[] = []
    let hasMore = true

    while (hasMore) {
      const response = await xero.accountingApi.getContacts(
        tenantId,
        undefined, // ifModifiedSince
        where, // No where filter due to high volume restriction
        'Name ASC', // Sort by name
        iDs, // No specific IDs
        page, // Pagination
        includeArchived, // Exclude archived
        summaryOnly, // Full details
        searchTerm, // No search term
        pageSize // 100 per page
      )

      const customers =
        response.body.contacts
          ?.filter(
            (contact) =>
              // contact.contactStatus === 'ACTIVE' &&
              contact.isCustomer === true
          )
          .map((contact) => ({
            contactID: contact.contactID!,
            name: contact.name!,
            emailAddress: contact.emailAddress || 'N/A',
            contactStatus: contact.contactStatus!,
            isCustomer: contact.isCustomer ?? null
          })) || []

      allCustomers = allCustomers.concat(customers)
      page += 1
      hasMore = response.body.contacts?.length === pageSize // Check raw response length

      if (page > 2) break
    }

    console.debug(`Fetched ${allCustomers.length} customers`)
    return allCustomers
  } catch (error: any) {
    console.error('Xero Fetch Error:', error)

    if (error?.response?.status === 401) {
      throw new Error('Unauthorized - please reconnect to Xero')
    }
    throw new Error('Failed to fetch customers from Xero')
  }
}
