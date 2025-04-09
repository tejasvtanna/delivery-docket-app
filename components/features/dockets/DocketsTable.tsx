'use client'

import { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
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
import { getProducts } from '@/actions/product.actions'
import { Button } from '@/components/ui/button'
import { DocketModal } from './DocketModal'
import { DocketPrintView } from './DocketPrintView' // New component
import { Pencil, Printer, Eye } from 'lucide-react'
import { Dropdown } from '@/components/common/Dropdown'
import { XeroCustomer } from '@/actions/customer.actions'
import { DocketPrintTestModal } from './DocketPrintTestModal'

interface Props {
  dockets: (Docket & { product: Product })[]
}

export const DocketsTable = ({ dockets }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const { data: allCustomers = [] } = useQuery({
    queryKey: ['xero-customers'],
    queryFn: fetchXeroCustomers
  })

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: getProducts
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<XeroCustomer | null>(
    null
  )
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showPrintTest, setShowPrintTest] = useState(false)
  const [editingDocket, setEditingDocket] = useState<
    (Docket & { product: Product }) | null
  >(null)
  const [printingDocket, setPrintingDocket] = useState<
    (Docket & { product: Product }) | null
  >(null)

  // Filter dockets based on search term, customer, and product
  const filteredDockets = dockets.filter((docket) => {
    const matchesSearch = [
      docket.docketNumber,
      docket.customerId,
      docket.orderNumber
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesCustomer =
      !selectedCustomer || selectedCustomer.contactID === docket.customerId
    const matchesProduct =
      !selectedProduct || selectedProduct.id === docket.productId

    return matchesSearch && matchesCustomer && matchesProduct
  })

  // Printing handler
  const handleDocketPrint = useReactToPrint({
    contentRef,
    onAfterPrint: () => setPrintingDocket(null) // Reset after printing
  })

  return (
    <>
      <div className='space-y-4'>
        {/* Header, Filters, and Search */}
        <div className='flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>Dockets</h1>
            <Button onClick={() => setIsAdding(true)}>Add Docket</Button>
          </div>
          <div className='flex gap-4 items-center'>
            <Input
              placeholder='Search dockets...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-xs'
            />
            <Dropdown
              placeholder='Filter by Customer'
              options={allCustomers}
              value={selectedCustomer}
              onChange={(val) =>
                setSelectedCustomer(val as XeroCustomer | null)
              }
              valuePropName='contactID'
              labelPropName='name'
              multiSelect={false}
              className='w-72 bg-white shadow-sm text-gray-900'
              showClearIcon={true}
            />
            <Dropdown
              placeholder='Filter by Product'
              options={allProducts}
              value={selectedProduct}
              onChange={(val) => setSelectedProduct(val as Product | null)}
              valuePropName='id'
              labelPropName='name'
              multiSelect={false}
              className='w-72 bg-white shadow-sm text-gray-900'
              showClearIcon={true}
            />
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
                <TableHead>Actions</TableHead>
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
                    <TableCell className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setEditingDocket(docket)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setPrintingDocket(docket)
                          setTimeout(() => {
                            handleDocketPrint()
                          }, 500)
                        }}
                      >
                        <Printer className='h-4 w-4' />
                      </Button>

                      {/* <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          setPrintingDocket(docket)
                          setShowPrintTest(true)
                        }}
                      >
                        <Eye className='h-4 w-4' />
                      </Button> */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className='text-center'>
                    No dockets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isAdding && <DocketModal onClose={() => setIsAdding(false)} />}
      {editingDocket && (
        <DocketModal
          docket={editingDocket}
          onClose={() => setEditingDocket(null)}
        />
      )}

      {printingDocket && (
        <div className='hidden'>
          <DocketPrintView docket={printingDocket} ref={contentRef} />
        </div>
      )}

      {showPrintTest && printingDocket && (
        <DocketPrintTestModal
          isOpen={showPrintTest}
          onOpenChange={() => setShowPrintTest(false)}
          docket={printingDocket}
        />
      )}
    </>
  )
}
