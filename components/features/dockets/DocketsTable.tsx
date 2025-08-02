'use client'

import { useRef, useState, useMemo, useTransition } from 'react'
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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchXeroCustomers } from '@/actions/customer.actions'
import { getProducts } from '@/actions/product.actions'
import { Button } from '@/components/ui/button'
import { DocketModal } from './DocketModal'
import { Pencil, Printer, Eye, Trash } from 'lucide-react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@radix-ui/react-popover'
import { DocketPrintView } from './DocketPrintView'
import { DocketPrintTestModal } from './DocketPrintTestModal'
import { ConfirmationModal } from '@/components/common/ConfirmationModal'
import { toast } from 'sonner'
import { deleteDockets } from '@/actions/docket.actions'

interface Props {
  dockets: (Docket & { product: Product })[]
}

const docketStatusOptions = Object.entries(DocketStatus)
  .filter(([key, value]) => typeof value === 'number')
  .map(([key, value]) => ({
    label: key === 'InvoiceGenerated' ? 'Invoice Generated' : key, // Add space for InvoiceGenerated
    value: value as number
  }))

interface DocketStatusOption {
  label: string
  value: number
}

export const DocketsTable = ({ dockets }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

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
  const [selectedStatus, setSelectedStatus] =
    useState<DocketStatusOption | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingDocket, setEditingDocket] = useState<
    (Docket & { product: Product }) | null
  >(null)
  const [printingDocket, setPrintingDocket] = useState<
    (Docket & { product: Product }) | null
  >(null)
  const [testingDocket, setTestingDocket] = useState<
    (Docket & { product: Product }) | null
  >(null)
  const [selectedDockets, setSelectedDockets] = useState<Docket[]>([])
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false)

  const filteredDockets = dockets.filter((docket) => {
    const matchesSearch =
      !searchTerm ||
      docket.docketNumber.toUpperCase() === searchTerm.toUpperCase() ||
      docket.orderNumber === searchTerm

    const matchesCustomer =
      !selectedCustomer || selectedCustomer.contactID === docket.customerId
    const matchesProduct =
      !selectedProduct || selectedProduct.id === docket.productId
    const matchesStatus =
      !selectedStatus || selectedStatus.value === docket.status

    return matchesSearch && matchesCustomer && matchesProduct && matchesStatus
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

  const handleDeleteDocket = () => {
    startTransition(async () => {
      const result = await deleteDockets(
        selectedDockets.map((docket) => docket.id)
      )
      if (result.success) {
        toast.success('Docket(s) deleted successfully')
      } else {
        toast.error('Something went wrong, please try again later')
      }
      setIsDeleteConfirmationOpen(false)
    })
  }

  // Function to format the status display
  const formatStatus = (status: DocketStatus) => {
    if (status === DocketStatus.InvoiceGenerated) {
      return 'Invoice Generated'
    }
    return DocketStatus[status]
  }

  const createTooltipContent = useMemo(() => {
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

  const deleteTooltipContent = useMemo(() => {
    if (!selectedDockets.length) return 'Select a docket'
    if (
      selectedDockets.some(
        (docket) => docket.status === DocketStatus.InvoiceGenerated
      )
    ) {
      return 'Invoice already generated for the selected docket(s)'
    }
    return 'Delete docket(s)'
  }, [selectedDockets])

  return (
    <>
      <div className='space-y-4'>
        <div className='flex flex-col gap-4'>
          <div
            data-header-and-cta
            className='flex justify-between items-center'
          >
            <h1 className='text-2xl font-bold'>
              Dockets ({filteredDockets.length})
            </h1>

            <div className='flex items-center gap-2'>
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
                    {createTooltipContent}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant='link'
                        onClick={() => setIsDeleteConfirmationOpen(true)}
                        disabled={
                          selectedDockets.length === 0 ||
                          selectedDockets.some(
                            (docket) =>
                              docket.status === DocketStatus.InvoiceGenerated
                          )
                        }
                        className='border-2 border-solid'
                      >
                        <Trash className='h-4 w-4' />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className='bg-gray-800 text-white text-sm rounded-md px-2 py-1 shadow-lg'>
                    {deleteTooltipContent}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div data-filters className='flex gap-4 items-center'>
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
            <Dropdown
              placeholder='Filter by Status'
              options={docketStatusOptions}
              value={selectedStatus}
              onChange={(val) =>
                setSelectedStatus(val as DocketStatusOption | null)
              }
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
                    className='h-4 w-4 cursor-pointer'
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
                        className='h-4 w-4 cursor-pointer'
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
                    <TableCell>
                      {docket.status === DocketStatus.InvoiceGenerated ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <span className='text-blue-600 underline cursor-pointer'>
                              {formatStatus(docket.status)}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className='bg-white border rounded-md shadow-lg p-4 w-64'>
                            <div className='space-y-1'>
                              <p className='text-sm font-medium'>
                                <b>Status:</b> {formatStatus(docket.status)}
                              </p>
                              <p className='text-sm'>
                                <b>Generated On:</b>{' '}
                                {docket.invoiceGeneratedOn
                                  ? new Date(
                                      docket.invoiceGeneratedOn
                                    ).toLocaleString()
                                  : 'N/A'}
                              </p>
                              <p className='text-sm'>
                                <b>Generated By:</b>{' '}
                                {docket.invoiceGeneratedBy || 'N/A'}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        formatStatus(docket.status)
                      )}
                    </TableCell>
                    <TableCell className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setEditingDocket(docket)}
                      >
                        {docket.status === DocketStatus.InvoiceGenerated ? (
                          <Eye className='h-4 w-4' />
                        ) : (
                          <Pencil className='h-4 w-4' />
                        )}
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
                      {/* <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setTestingDocket(docket)}
                      >
                        <Captions className='h-4 w-4' />
                      </Button> */}
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

      {testingDocket && (
        <DocketPrintTestModal
          isOpen={true}
          onOpenChange={() => setTestingDocket(null)}
          docket={testingDocket}
        />
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
            queryClient.invalidateQueries({ queryKey: ['dockets'] })
          }}
        />
      )}

      {isDeleteConfirmationOpen && (
        <ConfirmationModal
          open={isDeleteConfirmationOpen}
          onOpenChange={setIsDeleteConfirmationOpen}
          title={`Delete ${selectedDockets.length} Docket`}
          description={`Are you sure you want to delete ${selectedDockets.length} docket(s)? This action can't be undone.`}
          primaryButton={
            <Button onClick={handleDeleteDocket} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          }
          secondaryButton={
            <Button onClick={() => setIsDeleteConfirmationOpen(false)}>
              Cancel
            </Button>
          }
        />
      )}
    </>
  )
}
