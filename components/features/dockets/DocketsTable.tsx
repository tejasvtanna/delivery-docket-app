'use client'

import { useRef, useState, useMemo } from 'react'
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
import { DocketPrintView } from './DocketPrintView'
import { Pencil, Printer } from 'lucide-react'
import { Dropdown } from '@/components/common/Dropdown'
import { XeroCustomer } from '@/actions/customer.actions'
import { InvoiceCreationModal } from './InvoiceCreationModal'
import { DocketStatus } from '@/types/docket.types'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@radix-ui/react-tooltip'

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
  const [editingDocket, setEditingDocket] = useState<
    (Docket & { product: Product }) | null
  >(null)
  const [printingDocket, setPrintingDocket] = useState<
    (Docket & { product: Product }) | null
  >(null)
  const [selectedDockets, setSelectedDockets] = useState<Docket[]>([])
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  const filteredDockets = dockets.filter((docket) => {
    const matchesSearch =
      !searchTerm ||
      docket.docketNumber.toString() === searchTerm ||
      docket.orderNumber === searchTerm

    const matchesCustomer =
      !selectedCustomer || selectedCustomer.contactID === docket.customerId
    const matchesProduct =
      !selectedProduct || selectedProduct.id === docket.productId

    return matchesSearch && matchesCustomer && matchesProduct
  })

  const handleDocketPrint = useReactToPrint({
    contentRef,
    onAfterPrint: () => setPrintingDocket(null)
  })

  const handleSelectDocket = (docket: Docket) => {
    setSelectedDockets((prev) =>
      prev.some((doc) => doc.id === docket.id)
        ? prev.filter((doc) => doc.id !== docket.id)
        : [...prev, docket]
    )
  }

  const handleCreateInvoice = async () => {
    if (selectedDockets.length > 0) {
      setIsInvoiceModalOpen(true)
    }
  }

  const tooltipContent = useMemo(() => {
    if (!selectedDockets.length) return 'Select a docket'
    if (
      selectedDockets.some(
        (docket) => docket.status === DocketStatus.InvoiceGenerated
      )
    ) {
      return 'Invoice already generated for the selected docket(s)'
    }
    return 'Create invoice'
  }, [selectedDockets])

  return (
    <>
      <div className='space-y-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>
              Dockets ({filteredDockets.length})
            </h1>
            <div className='space-x-2'>
              <Button onClick={() => setIsAdding(true)}>Add Docket</Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={handleCreateInvoice}
                        disabled={
                          selectedDockets.length === 0 ||
                          selectedDockets.some(
                            (docket) =>
                              docket.status === DocketStatus.InvoiceGenerated
                          )
                        }
                      >
                        Create Invoice
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className='bg-gray-800 text-white text-sm rounded-md px-2 py-1 shadow-lg'>
                    {tooltipContent}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className='flex gap-4 items-center'>
            <Input
              placeholder='Search by docket # or order #'
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

        <div className='border rounded-md'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type='checkbox'
                    checked={selectedDockets.length === filteredDockets.length}
                    onChange={(e) =>
                      setSelectedDockets(
                        e.target.checked ? filteredDockets : []
                      )
                    }
                  />
                </TableHead>
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
                    <TableCell>
                      <input
                        type='checkbox'
                        checked={selectedDockets.some(
                          (doc) => doc.id === docket.id
                        )}
                        onChange={() => handleSelectDocket(docket)}
                      />
                    </TableCell>
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
                    <TableCell>€{docket.price.toFixed(2)}</TableCell>
                    <TableCell>{DocketStatus[docket.status]}</TableCell>
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
                          setTimeout(() => handleDocketPrint(), 500)
                        }}
                      >
                        <Printer className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className='text-center'>
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

      {isInvoiceModalOpen && (
        <InvoiceCreationModal
          selectedDockets={
            selectedDockets.filter(Boolean) as (Docket & { product: Product })[]
          }
          onClose={() => setIsInvoiceModalOpen(false)}
          onCreateInvoice={() => {
            console.log('Creating invoice for dockets:', selectedDockets)
            setSelectedDockets([])
            setIsInvoiceModalOpen(false)
          }}
        />
      )}
    </>
  )
}
