import { XeroProvider } from '@/components/features/xero/XeroProvider'
import { CustomersTable } from '@/components/features/customers/CustomersTable'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function CustomersPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/login')
  }

  return (
    <XeroProvider>
      <CustomersTable />
    </XeroProvider>
  )
}
