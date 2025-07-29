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
      <div ref={ref} data-pdf-view className='mx-auto p-4 text-sm w-full'>
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

        <div data-page-1 className='font-mono'>
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
              <div className='field bc'>
                {new Date(docket.createdAt).toLocaleDateString()}
              </div>
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
                <div className='flex gap-2 justify-between w-[444px] text-xs'>
                  <div>
                    <div>Telephone: 063 91503</div>
                    <div>Mobile: 086 033 8078</div>
                  </div>
                  <img src='/ce.svg' alt='CE Logo' width='40' height='40' />
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
              <section className='col-span-3 row-span-5 text-base flex flex-col items-center justify-center border border-black'></section>

              <section className='col-span-5 row-span-7 grid grid-cols-3 grid-rows-[repeat(7,_30px)]'>
                <div className='col-span-3'></div>
                <div className='col-span-3 row-span-4 vertical-align-top p-1'>
                  COMMENTS:{' '}
                </div>

                <section className='row-span-2 flex flex-col items-start justify-start p-1 border border-black'>
                  <div>
                    RECEIVED IN GOOD ORDER AND CONDITION BY: {docket.receivedBy}
                  </div>
                  <div className='col-span-2'></div>
                </section>
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

        <div
          data-page-2
          className='flex flex-col'
          style={{
            fontFamily: 'arial narrow',
            lineHeight: '1.5',
            pageBreakBefore: 'always',
            breakInside: 'avoid'
          }}
        >
          <div className='text-center font-bold text-lg mt-1'>
            CONDITIONS OF SUPPLY OF GOODS
          </div>

          <div className='text-sm mt-1'>
            For the purposes of these conditions, 'customer' means the person or
            company ordering the goods on the reverse hereof; 'Ballyorgan
            Quarries' means Ballyorgan Quarries Limited; 'goods' means the goods
            as described on the reverse hereof and the price of the goods are as
            noted on the reverse hereof excluding V.A.T.
          </div>

          <div
            className='text-sm'
            style={{
              color: 'grey',
              columns: '4',
              columnGap: '6px'
              /* You can also use 'column-fill: balance;' if supported and desired for balancing on the last page */
            }}
          >
            <ol className='list-decimal ml-6'>
              <li>
                Where Ballyorgan Quarries delivers the goods using its own
                transport to a location off hard road or Ballyorgan Quarries
                uses a third party to deliver the goods at the time the goods
                are received by the said third party or if the customer
                wrongfully fails to take delivery of the goods, the time when
                Ballyorgan Quarries has tendered delivery of the goods
              </li>
              <li>
                The customer shall pay the price of the goods on delivery or
                within 30 days of the date of Ballyorgan Quarries invoice where
                agreed by Ballyorgan Quarries. The time of payment of the price
                shall be of the essence of the contract herein. If the customer
                fails to make any payment on the due date then, without limiting
                any other right or remedy available to Ballyorgan Quarries may:
                <ol className='ml-6' style={{ listStyleType: 'lower-alpha' }}>
                  <li>
                    cancel the contract herein or suspend any further deliveries
                    to the customer
                  </li>
                  <li>
                    appropriate any payment made by the customer to such of the
                    goods (or the goods suppited under any other contract
                    between the customer and Ballyorgan Quarries as Ballyorgan
                    Quarries may think fit (notwithstanding any purported
                    appropriation by the customer) and
                  </li>
                  <li>
                    charge the customer interest (both before and after
                    judgement) on the amount unpaid at the rate of 1.5% per
                    month, until payment in full is made (a part of month being
                    treated as a full month for the purpose of calculating
                    interest);
                  </li>
                  <li>
                    recover legal fees and other costs incurred in the recovery
                    of overdue debts and
                  </li>
                  <li>
                    all bank charges incurred by Ballyorgan Quarries due to
                    cheques offered in payment which are dishonoured.
                  </li>
                </ol>
              </li>
              <li>
                If inlays are incurred by Ballyorgan Quarries for the unloading
                of the goods after a reasonable period of time has elapsed, then
                Ballyorgan Quarries shall be entitled to charge €55 per hour or
                pro rata for any excess time incurred for unloading.
              </li>
              <li>
                Where the goods are to be delivered in instalments, each
                delivery shall constitute a separate contract and failure by
                Ballyorgan Quarries to deliver any one or more of the
                instalments in accordance with these terms or any claim by the
                customer in respect of any one or more instaiments shall not
                entitle the customer to treat the contract herein as a whole as
                repudiated.
              </li>
              <li>
                If Ballyorgan Quarries fail to deliver the goods (or any
                instalment) for any reason other than any cause beyond
                Ballyorgan Quarries reasonable control of the customer's fault
                and Ballyorgan Quarries is accordingly liable to the customer,
                Ballyorgan Quarries liability shall be limited to the excess (if
                any) of the cost to the customer (in the cheapest available
                market) of similar goods to replace those not delivered over the
                price of the goods
              </li>
              <li>
                Delivery of goods in the form of concrete shall be made to the
                nearest accessible location on site and shall not be responsible
                for placing concrete on site
              </li>
              <li>
                No responsibility or liability shall be accepted by Ballyorgan
                Quarries for slump or the quality of ready-mix concrete in which
                additional water or other materials have been added by the
                customer or at his requests
              </li>
              <li>
                Risk or damage to or loss of the goods shall become the
                customer's responsibility in the case of goods to be delivered
                otherwise that at Ballyorgan Quarries premises or at the time of
                delivery or place or is deemed to have taken place:
              </li>
              <li>
                Ownership in the goods shall not pass to the customer until
                Ballyorgan Quarries have been paid the once of the goods and
                until such time as the ownership of the goods passes to the
                customer (and provided the goods are still in existence and have
                not been resold or used in the ordinary course of its business),
                Ballyorgan Quarries may at any time require the customer to
                deliver up the goods to Ballyorgan Quarries and, if the customer
                fails to do so forthwith, enter on any premises of the customer
                or any third party where the goods are stored and repossess the
                goods.
              </li>
              <li>
                Subject as expressly provided in these terms and, except where
                the goods are sold to a person dealing as a consumer (within the
                meaning of the Unfair Contract Terms Act 1977), all warranties,
                conditions or other terms Implied by statute or common law are
                excluded to the fullest extent permitted by law.
              </li>
              <li>
                Where the goods are sold to a customer who is dealing as a
                consumer (as defined by the Sale of Goods and Supply of Services
                Act 1980) the statutory rights of the customer are not affected
                by the terms.
              </li>
              <li>
                A claim by the customer which is based on any defect in the
                quality or condition of the goods or their failure to correspond
                with specification shall (whether or not delivery is refused by
                the customer) be notified to Ballyorgan Quarries in writing
                within three days from the date of delivery or (where the defect
                or failure was not apparent in reasonable time) after discovery
                of the defect or failure. If delivery is not refused and the
                customer does not notify Ballyorgan Quarries accordingly, the
                customer shall not be entitled to reject the goods and
                Ballyorgan Quarries shall have no liability for such defect or
                failure and the customer shall be bound to pay the price as if
                the goods had been delivered in accordance with the contract.
              </li>
              <li>
                No waiver by Ballyorgan Quarries or any breach of the contract
                by the customer shall be considered as a waiver of any
                subsequent breach of the same or any other provision.
              </li>
              <li>
                If any provision of the contract is held by a court or other
                competent authority to be Invalid or unenforceable in whole or
                in part, the validity of the other provisions of the contract
                and the remainder of the provision in question shall not be
                affected.
              </li>
              <li>
                The contract shall be governed by the laws of the republic of
                Ireland and the customer agrees to submit to the non-exclusive
                jurisdiction of the Irish courts
              </li>
            </ol>
          </div>
        </div>
      </div>
    )
  }
)

DocketPrintView.displayName = 'DocketPrintView'
