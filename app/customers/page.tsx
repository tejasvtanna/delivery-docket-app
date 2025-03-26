import { XeroProvider } from '@/components/features/xero/XeroProvider'
import { CustomersTable } from '@/components/features/customers/CustomersTable'

export default function CustomersPage() {
  return (
    <XeroProvider>
      <div className='container mx-auto py-10'>
        <h1 className='text-2xl font-bold mb-5'>Customers</h1>

        <CustomersTable />
      </div>
    </XeroProvider>
  )
}
