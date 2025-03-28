import { getDockets } from '@/actions/docket.actions'
import { DocketsTable } from '@/components/features/dockets/DocketsTable'
import { XeroProvider } from '@/components/features/xero/XeroProvider'

export default async function DocketsPage() {
  const dockets = await getDockets()

  //   console.debug({ dockets })

  return (
    <XeroProvider>
      <DocketsTable dockets={dockets} />
    </XeroProvider>
  )
}
