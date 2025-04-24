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

  // Validate refresh_token presence
  if (!tokenSet.refresh_token) {
    throw new Error(
      'Refresh token missing in tokenSet. Please re-authenticate with Xero.'
    )
  }

  xero.setTokenSet(tokenSet)

  const expiryThreshold = 5 * 60 * 1000 // 5 minutes in milliseconds
  const now = Date.now()
  if (now > tokenSet.expires_at! * 1000 - expiryThreshold) {
    // console.log('Refreshing token due to expiry or impending expiry...')
    // try {
    //   const newTokenSet = await xero.refreshToken()
    //   await saveTokenSet(newTokenSet, xeroAuth.tenantId)
    //   xero.setTokenSet(newTokenSet)
    //   console.log('Refreshed tokenSet:', {
    //     ...newTokenSet,
    //     tenantId: xeroAuth.tenantId
    //   })
    // } catch (error) {
    //   console.error('Failed to refresh Xero token:', error)

    //   const newTokenSet = await manualRefreshToken(tokenSet.refresh_token)
    //   await saveTokenSet(newTokenSet, xeroAuth.tenantId)
    //   xero.setTokenSet(newTokenSet)
    //   console.log('Refreshed tokenSet with fallback:', {
    //     ...newTokenSet,
    //     tenantId: xeroAuth.tenantId
    //   })
    // }
    // return { tenantId: xeroAuth.tenantId }
    // return { tenantId: xeroAuth.tenantId }

    const newTokenSet = await manualRefreshToken(tokenSet.refresh_token)
    await saveTokenSet(newTokenSet, xeroAuth.tenantId)
    xero.setTokenSet(newTokenSet)
    console.log('Manually Refreshed tokenSet:', {
      ...newTokenSet,
      tenantId: xeroAuth.tenantId
    })
    return { tenantId: xeroAuth.tenantId }
  }

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

// Fallback function to manually refresh token
async function manualRefreshToken(refreshToken: string): Promise<TokenSet> {
  const response = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.XERO_CLIENT_ID!,
      client_secret: process.env.XERO_CLIENT_SECRET!
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    token_type: data.token_type,
    scope: data.scope,
    expired: () => false,
    claims: data.claims
  }
}

export default xero
