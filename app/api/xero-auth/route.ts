import { NextResponse } from 'next/server'
import xero from '@/lib/xeroClient'

export async function GET() {
  const authUrl = await xero.buildConsentUrl()
  console.debug('Xero Auth URL:', authUrl)
  return NextResponse.redirect(authUrl)
}
