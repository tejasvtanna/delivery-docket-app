'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchXeroCustomers, XeroCustomer } from '@/actions/customer.actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export const CustomersTable = () => {
  const { data: customers = [] } = useQuery<XeroCustomer[]>({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })

  return (
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
  )
}
