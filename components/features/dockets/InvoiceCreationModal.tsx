'use client'

import { useState } from 'react'
import { Docket, Product } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { createXeroInvoice } from '@/actions/invoice.actions'

interface InvoiceCreationModalProps {
  selectedDockets: (Docket & { product: Product })[]
  onClose: () => void
  onCreateInvoice: () => void
}

export const InvoiceCreationModal = ({
  selectedDockets,
  onClose,
  onCreateInvoice
}: InvoiceCreationModalProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create invoice in Xero using the amount column
  const handleCreateXeroInvoice = async () => {
    setIsCreating(true)
    setError(null)

    try {
      await createXeroInvoice(selectedDockets)
      onCreateInvoice() // Close modal and clear selections
    } catch (err) {
      setError(
        `Failed to create invoice: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const totalAmount = selectedDockets.reduce(
    (sum, docket) => sum + docket.price * (docket.weight ?? 1),
    0
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl w-full'>
        <DialogHeader>
          <DialogTitle>Create Invoice for following Dockets</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='overflow-x-auto'>
            <Table className='table-auto'>
              <TableHeader>
                <TableRow>
                  <TableHead className='whitespace-nowrap'>
                    Docket Number
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>
                    Order Number
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>Product</TableHead>
                  <TableHead className='whitespace-nowrap'>Price</TableHead>
                  <TableHead className='whitespace-nowrap'>Qty</TableHead>
                  <TableHead className='whitespace-nowrap'>
                    Total Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDockets.map((docket) => (
                  <TableRow key={docket.id}>
                    <TableCell className='truncate max-w-[150px]'>
                      {docket.docketNumber}
                    </TableCell>
                    <TableCell className='truncate max-w-[150px]'>
                      {docket.orderNumber}
                    </TableCell>
                    <TableCell className='truncate max-w-[200px]'>
                      {docket.product.name}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      €{docket.price.toFixed(2)}
                    </TableCell>
                    <TableCell>{docket.weight}</TableCell>
                    <TableCell className='whitespace-nowrap'>
                      €{(docket.price * (docket.weight ?? 1)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className='text-right font-bold'>
                    Total
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    €{totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          {error && <p className='text-red-500'>{error}</p>}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateXeroInvoice} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
