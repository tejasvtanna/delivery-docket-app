'use client'

import { useState, useEffect } from 'react'
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
import xero, { getTokenSet } from '@/lib/xeroClient' // Import from your lib
import { Invoice } from 'xero-node' // Import Invoice type to access TypeEnum
import { LineAmountTypes } from 'xero-node' // Import Invoice type to access TypeEnum
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

  // Initialize Xero client with tokens
  //   useEffect(() => {
  //     const initializeXero = async () => {
  //       try {
  //         const tokenSet = await getTokenSet()
  //         // No need to set tenantId separately; it's handled by the token set
  //       } catch (err) {
  //         setError(
  //           'Failed to initialize Xero client: ' +
  //             (err instanceof Error ? err.message : 'Unknown error')
  //         )
  //         console.error(err)
  //       }
  //     }
  //     initializeXero()
  //   }, [])

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
    (sum, docket) => sum + docket.price * (docket.firstWeight ?? 1),
    0
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice for following Dockets</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Docket Number</TableHead>
                <TableHead>Order Number</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedDockets.map((docket) => (
                <TableRow key={docket.id}>
                  <TableCell>{docket.docketNumber}</TableCell>
                  <TableCell>{docket.orderNumber}</TableCell>
                  <TableCell>{docket.product.name}</TableCell>
                  <TableCell>€{docket.price.toFixed(2)}</TableCell>
                  <TableCell>{docket.firstWeight}</TableCell>
                  <TableCell>
                    €{(docket.price * (docket.firstWeight ?? 1)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className='text-right font-bold'>
                  Total
                </TableCell>
                <TableCell>€{totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
