import { getDockets } from '@/actions/docket.actions'
import { DocketsTable } from '@/components/features/dockets/DocketsTable'
import { XeroProvider } from '@/components/features/xero/XeroProvider'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DocketsPage() {
  const dockets = await getDockets()
  const { userId } = await auth()

  if (!userId) {
    redirect('/login')
  }

  return (
    <XeroProvider>
      <DocketsTable dockets={dockets} />
    </XeroProvider>
  )
}
