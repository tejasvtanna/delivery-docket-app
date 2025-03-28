'use client'

import { useState } from 'react'
import { Docket, Product } from '@prisma/client'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { fetchXeroCustomers } from '@/actions/customer.actions'
import { Button } from '@/components/ui/button'
import { DocketModal } from './DocketModal'

interface Props {
  dockets: (Docket & { product: Product })[]
}

export function DocketsTable({ dockets }: Props) {
  const { data: allCustomers = [] } = useQuery({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Filter dockets based on search term (docketNumber, customerId, or orderNumber)
  const filteredDockets = dockets.filter((docket) =>
    [docket.docketNumber, docket.customerId, docket.orderNumber]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className='space-y-4'>
        {/* Header and Search */}
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Dockets</h1>

          <div className='flex gap-2'>
            <Input
              placeholder='Search dockets...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-xs'
            />
            <Button onClick={() => setIsAdding(true)}>Add Docket</Button>
          </div>
        </div>

        {/* Table */}
        <div className='border rounded-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Docket Number</TableHead>
                <TableHead>Order Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDockets.length > 0 ? (
                filteredDockets.map((docket) => (
                  <TableRow key={docket.id}>
                    <TableCell>{docket.docketNumber}</TableCell>
                    <TableCell>{docket.orderNumber}</TableCell>
                    <TableCell>
                      {new Date(docket.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {
                        allCustomers.find(
                          (c) => c.contactID === docket.customerId
                        )?.name
                      }
                    </TableCell>
                    <TableCell>{docket.product.name}</TableCell>
                    <TableCell>${docket.price.toFixed(2)}</TableCell>
                    <TableCell>{docket.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className='text-center'>
                    No dockets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isAdding && <DocketModal onClose={() => setIsAdding(false)} />}
    </>
  )
}
