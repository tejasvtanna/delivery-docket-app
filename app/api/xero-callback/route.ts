import { NextResponse } from 'next/server'
import xero, { saveTokenSet } from '@/lib/xeroClient'
import { TokenSet } from 'xero-node'
import { currentUser } from '@clerk/nextjs/server'

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
    const user = await currentUser()

    await saveTokenSet(
      tokenSet,
      tenantId,
      user?.emailAddresses[0]?.emailAddress!
    )

    // Redirect to the production URL in prod, localhost in dev
    const redirectUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://delivery-docket-app.vercel.app/customers'
        : 'http://localhost:3333/customers'

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Xero OAuth Callback Error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with Xero' },
      { status: 500 }
    )
  }
}
