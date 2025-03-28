import { XeroProvider } from '@/components/features/xero/XeroProvider'
import { CustomersTable } from '@/components/features/customers/CustomersTable'

export default function CustomersPage() {
  return (
    <XeroProvider>
      <CustomersTable />
    </XeroProvider>
  )
}
