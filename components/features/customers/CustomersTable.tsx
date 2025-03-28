'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'

export function CustomersTable() {
  const { data: customers = [] } = useQuery<XeroCustomer[]>({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })

  const [searchText, setSearchText] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<XeroCustomer[]>([])

  useEffect(() => {
    const filtered = customers.filter((customer) => {
      if (customer.contactID.toLowerCase().includes(searchText)) {
        return true
      }
      if (customer.name.toLowerCase().includes(searchText)) {
        return true
      }
      if (customer.contactStatus.toLowerCase().includes(searchText)) {
        return true
      }
      if (customer.emailAddress?.toLowerCase().includes(searchText)) {
        return true
      }

      return false
    })
    setFilteredCustomers(filtered)
  }, [searchText, customers])

  return (
    <>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold mb-5'>Customers</h1>

        <Input
          onChange={(e) => setSearchText(e.target.value.toLowerCase())}
          className='w-1/3 rounded'
        />
      </div>

      <Table className='mt-2'>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <TableRow key={customer.contactID}>
                <TableCell>{customer.contactID}</TableCell>
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
    </>
  )
}
