import { forwardRef } from 'react'
import { Docket, Product } from '@prisma/client'

interface DocketPrintViewProps {
  docket: Docket & { product: Product }
  id: string // For react-to-print to target
}

export const DocketPrintView = forwardRef<HTMLDivElement, DocketPrintViewProps>(
  ({ docket, id }, ref) => {
    return (
      <div ref={ref} id={id} className='p-4'>
        <style>
          {`
            @page {
              size: landscape;
            }
          `}
        </style>
        <h1 className='text-2xl font-bold'>Docket #{docket.docketNumber}</h1>
        <div className='mt-4 space-y-2'>
          <p>
            <strong>Order Number:</strong> {docket.orderNumber}
          </p>
          <p>
            <strong>Date:</strong> {new Date(docket.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Customer ID:</strong> {docket.customerId}
          </p>
          <p>
            <strong>Product:</strong> {docket.product.name}
          </p>
          <p>
            <strong>Price:</strong> ${docket.price.toFixed(2)}
          </p>
          <p>
            <strong>Status:</strong> {docket.status}
          </p>
          <p>
            <strong>Driver Reg Number:</strong>{' '}
            {docket.driverRegNumber || 'N/A'}
          </p>
          <p>
            <strong>Delivery Address:</strong> {docket.deliveryAddress || 'N/A'}
          </p>
          <p>
            <strong>Inspected By:</strong> {docket.inspectedBy || 'N/A'}
          </p>
          <p>
            <strong>Delivered By:</strong> {docket.deliveredBy || 'N/A'}
          </p>
          <p>
            <strong>First Weight:</strong> {docket.firstWeight || 'N/A'}
          </p>
          <p>
            <strong>Second Weight:</strong> {docket.secondWeight || 'N/A'}
          </p>
          <p>
            <strong>Third Weight:</strong> {docket.thirdWeight || 'N/A'}
          </p>
          <p>
            <strong>Received By:</strong> {docket.receivedBy || 'N/A'}
          </p>
        </div>
      </div>
    )
  }
)

DocketPrintView.displayName = 'DocketPrintView'
