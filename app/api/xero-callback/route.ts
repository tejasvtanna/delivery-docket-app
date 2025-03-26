import { NextResponse } from 'next/server'
import xero, { saveTokenSet } from '@/lib/xeroClient'
import { TokenSet } from 'xero-node' // Use xero-node's TokenSet for consistency

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code missing' },
      { status: 400 }
    )
  }

  try {
    const tokenSet: TokenSet = await xero.apiCallback(url.toString())
    const tenants = await xero.updateTenants(false)
    const tenantId = tenants[0].tenantId

    // Mutate tokenSet directly to add tenantId
    ;(tokenSet as TokenSet & { tenantId?: string }).tenantId = tenantId

    await saveTokenSet(tokenSet)

    // Optional: Invalidate cache on new tokens
    // if (typeof window !== 'undefined') {
    //   const { queryClient } = require('@tanstack/react-query')
    //   queryClient.invalidateQueries(['xero-customers'])
    // }

    return NextResponse.redirect('http://localhost:3333/customers') // Adjust for prod
  } catch (error) {
    console.error('Xero OAuth Callback Error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with Xero' },
      { status: 500 }
    )
  }
}
