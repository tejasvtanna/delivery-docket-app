import { forwardRef, useId } from 'react'
import { Docket, Product } from '@prisma/client'
import { fetchXeroCustomers } from '@/actions/customer.actions'
import { useQuery } from '@tanstack/react-query'

interface DocketPrintViewProps {
  docket: Docket & { product: Product }
}

export const DocketPrintView = forwardRef<HTMLDivElement, DocketPrintViewProps>(
  ({ docket }, ref) => {
    const uniqueClass = `docket-${useId().replace(/:/g, '')}` // e.g., "docket-Rabc123"
    const { data: customers } = useQuery({
      queryKey: ['xero-customers'],
      queryFn: fetchXeroCustomers
    })
    const customer = customers?.find(
      (customer) => customer.contactID === docket.customerId
    )

    return (
      <div ref={ref} className='mx-auto p-4 font-mono text-sm w-full'>
        <style>
          {`
            @page {
              size: landscape;
              margin: 10;
            }
            .${uniqueClass} .grid > div {
              border: 1px solid black;
              min-width: 0;
              padding-left: 5px;
            }
            .${uniqueClass} .grid .field {
              // color: blue;
            }
            .${uniqueClass} .grid .bc {
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .${uniqueClass} .grid .vc {
              display: flex;
              align-items: center;
            }
          `}
        </style>
        <h2 className='text-center font-bold text-lg mb-2 uppercase'>
          Delivery Docket
        </h2>

        <div className={uniqueClass}>
          <div className='grid grid-cols-8 w-full grid-rows-[repeat(17,_30px)] border border-black'>
            {/* ROW-1 */}
            <div className='bc'>Driver Reg. No</div>
            <div className='bc'>Radius</div>
            <div className='bc'>Date</div>
            <div className='col-span-2'></div>
            <div className='bc'>Weight</div>
            <div className='bc filed col-span-2'>{docket.weight} KG</div>

            {/* ROW-2 */}
            <div className='field bc'>{docket.driverRegNumber}</div>
            <div></div>
            <div className='field bc'>{new Date().toLocaleDateString()}</div>
            <div className='col-span-2'></div>
            <div className='bc'>Inspected by</div>
            <div className='bc flex-wrap text-xs col-span-2'>
              {docket.inspectedBy}
            </div>

            {/* BALLYORGAN QUARRIES LIMITED */}
            <section className='col-span-5 row-span-8 flex flex-col items-start justify-between p-2 border border-black'>
              <div className='text-lg font-bold'>
                BALLYORGAN QUARRIES LIMITED
              </div>
              <div>Kilfinane Co. Limerick.</div>
              <div className='flex gap-2 justify-between w-96 text-xs'>
                <div>
                  <div>Telephone: 063 91503</div>
                  <div>Mobile: 086 033 8078</div>
                </div>
                <div>
                  <div>NSAI 0050 CPR-0449 - IS EN 13242</div>
                  <div>NSAI 0050 CPR-0450 - IS EN 13043</div>
                </div>
              </div>
              <div>Email: ballyorganquarries01@gmail.com</div>
              <div>VAT No. IE9844373D</div>

              <div className='mt-2'>
                <div>INVOICE to CUSTOMER: {customer?.name}</div>
                <div>DELIVER TO: {docket.deliveryAddress}</div>
                <div>PRODUCT: {docket.product.name}</div>
                <div>ORDER NO: {docket.orderNumber}</div>
              </div>
            </section>

            <div className='bc'>Delivered by</div>
            <div className='field bc col-span-2'>{docket.deliveredBy}</div>

            {/* DELIVERY DOCKET */}
            <div className='col-span-3 row-span-2 text-base font-bold flex items-center justify-center'>
              DELIVERY DOCKET No. {docket.docketNumber}
            </div>

            {/* HARMONIZED STANDARD */}
            <section className='col-span-3 row-span-5 text-base flex flex-col items-center justify-center border border-black'>
              <span>Confirms to</span>
              <span>Harmonized European Standard</span>
              <span>IS EN 13043 & S.R 17</span>
            </section>

            <section className='col-span-5 row-span-7 grid grid-cols-3 grid-rows-[repeat(7,_30px)]'>
              <div className='col-span-3'></div>
              <div className='col-span-3 vc'>COMMENTS: </div>
              <div className='row-span-2 vc'>
                EXTRA WATER ADDED AT CUSTOMER'S INSTRUCTIONS
              </div>
              <div className='row-span-2'></div>
              <div className='grid grid-cols-[1fr,0.4fr,1fr]'>
                <span className='vc'>SALE VALUE</span>
                <span className='vc'>€</span>
                <span className='vc'>
                  {(docket.weight ?? 0) * docket.price}
                </span>
              </div>
              <div className='grid grid-cols-[1fr,0.4fr,1fr]'>
                <span className='vc'>CT/SUR</span>
                <span className='vc'>€</span>
                <span className='vc'>0</span>
              </div>

              <div className='vc'>RESULTING SLUMP:</div>
              <div></div>
              <div className='grid grid-cols-[1fr,0.4fr,1fr]'>
                <span className='vc'>SUB TOTAL</span>
                <span className='vc'>€</span>
                <span className='vc'></span>
              </div>

              <section className='col-span-2 row-span-2 flex flex-col items-start justify-start p-1 border border-black'>
                <div>
                  RECEIVED IN GOOD ORDER AND CONDITION BY: {docket.receivedBy}
                </div>
                <div></div>
              </section>

              <div className='grid grid-cols-[1fr,0.4fr,1fr]'>
                <span className='vc'>VAT</span>
                <span className='vc'>@</span>
                <span className='vc'></span>
              </div>

              <div className='grid grid-cols-[1fr,0.4fr,1fr]'>
                <span className='vc'>TOTAL</span>
                <span className='vc'>€</span>
                <span className='vc'></span>
              </div>
            </section>

            <section className='col-span-3 row-span-7 grid grid-cols-2 grid-rows-[repeat(7,_30px)]'>
              <div className='vc'>TIME ON SITE</div>
              <div></div>

              <div className='vc'>TIME OFF SITE</div>
              <div></div>

              <div className='vc'>WAITING TIME</div>
              <div></div>

              <div className='vc'>DESPATCHED BY</div>
              <div></div>

              <div className='vc'>CASH RECD BY</div>
              <div></div>

              <div className='vc'>PART LOAD</div>
              <div></div>

              <div className='vc'>BATCHED BY</div>
              <div></div>
            </section>
          </div>
        </div>
      </div>
    )
  }
)

DocketPrintView.displayName = 'DocketPrintView'
