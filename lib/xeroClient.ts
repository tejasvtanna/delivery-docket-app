import { XeroClient, TokenSet } from 'xero-node'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const xero = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID!,
  clientSecret: process.env.XERO_CLIENT_SECRET!,
  redirectUris: [process.env.XERO_REDIRECT_URI!],
  scopes: [
    'accounting.transactions',
    'accounting.contacts.read',
    'offline_access'
  ]
})

export async function xeroInit(): Promise<{ tenantId: string }> {
  let xeroAuth = await prisma.xeroAuth.findFirst()

  if (!xeroAuth || !xeroAuth.tokenSet || !xeroAuth.tenantId) {
    throw new Error(
      'No valid Xero tokens found. Please authenticate with Xero.'
    )
  }

  const tokenSet: TokenSet = xeroAuth.tokenSet as unknown as TokenSet

  const expiryThreshold = 5 * 60 * 1000 // 5 minutes in milliseconds
  const now = Date.now()
  if (now > tokenSet.expires_at! * 1000 - expiryThreshold) {
    console.log('Refreshing token due to expiry or impending expiry...')
    try {
      const newTokenSet = await xero.refreshToken()
      await saveTokenSet(newTokenSet, xeroAuth.tenantId)
      xero.setTokenSet(newTokenSet)
      console.log('Refreshed tokenSet:', {
        access_token: newTokenSet.access_token,
        refresh_token: newTokenSet.refresh_token,
        expires_at: newTokenSet.expires_at,
        tenantId: xeroAuth.tenantId
      })
    } catch (error) {
      console.error('Failed to refresh Xero token:', error)
      throw new Error('Token refresh failed. Please re-authenticate with Xero.')
    }
    return { tenantId: xeroAuth.tenantId }
  }

  xero.setTokenSet(tokenSet)
  console.log(
    'Token is valid, no refresh needed. Expires at:',
    new Date(tokenSet.expires_at! * 1000)
  )
  return { tenantId: xeroAuth.tenantId }
}

export async function saveTokenSet(tokenSet: TokenSet, tenantId: string) {
  const tokenData = {
    access_token: tokenSet.access_token,
    refresh_token: tokenSet.refresh_token,
    expires_at: tokenSet.expires_at,
    token_type: tokenSet.token_type,
    scope: tokenSet.scope
  }

  let xeroAuth = await prisma.xeroAuth.findFirst()
  if (xeroAuth) {
    await prisma.xeroAuth.update({
      where: { id: xeroAuth.id },
      data: {
        tokenSet: tokenData,
        tenantId,
        updatedAt: new Date()
      }
    })
  } else {
    await prisma.xeroAuth.create({
      data: {
        tokenSet: tokenData,
        tenantId
      }
    })
  }
}

export default xero
