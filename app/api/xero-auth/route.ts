import { NextResponse } from 'next/server'
import xero from '@/lib/xeroClient'

export async function GET() {
  try {
    const consentUrl = await xero.buildConsentUrl()
    return NextResponse.redirect(consentUrl)
  } catch (error) {
    console.error('Xero auth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Xero authentication' },
      { status: 500 }
    )
  }
}
