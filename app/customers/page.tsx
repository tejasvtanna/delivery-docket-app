import { fetchXeroCustomers, XeroCustomer } from '@/actions/customer.actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function CustomersPage() {
  let customers: XeroCustomer[] = []
  let error: string | null = null

  try {
    customers = await fetchXeroCustomers()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  if (error) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='text-2xl font-bold mb-5'>Customers</h1>
        <p className='mb-4'>{error}</p>
        <Button asChild>
          <Link href='/api/xero-auth'>Connect to Xero</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-2xl font-bold mb-5'>Customers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <TableRow key={customer.contactID}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.emailAddress}</TableCell>
                <TableCell>{customer.contactStatus}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className='text-center'>
                No customers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
