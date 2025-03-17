export interface XeroCustomer {
  id: string
  name: string
}

export async function fetchXeroCustomers(): Promise<XeroCustomer[]> {
  // Replace with real API call, e.g., fetch('https://api.zero.com/customers', { headers: { Authorization: 'Bearer YOUR_TOKEN' } })
  return [
    { id: 'cust1', name: 'Customer A' },
    { id: 'cust2', name: 'Customer B' },
    { id: 'cust3', name: 'Customer C' }
  ]
}
