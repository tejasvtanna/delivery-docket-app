import { XeroClient, TokenSet } from 'xero-node'
import fs from 'fs/promises'
import path from 'path'

const TOKEN_PATH =
  process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), 'xero-tokens-prod.json')
    : path.resolve(process.cwd(), 'xero-tokens-dev.json')

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

export async function getTokenSet(): Promise<TokenSet & { tenantId: string }> {
  const envToken = process.env.XERO_TOKEN_SET
  let tokenSet: TokenSet & { tenantId: string }

  if (envToken) {
    tokenSet = JSON.parse(envToken) as TokenSet & { tenantId: string }
    console.log('Loaded tokenSet from env:', {
      access_token: tokenSet.access_token,
      refresh_token: tokenSet.refresh_token,
      expires_at: tokenSet.expires_at,
      tenantId: tokenSet.tenantId
    })
  } else {
    try {
      const tokens = await fs.readFile(TOKEN_PATH, 'utf-8')
      tokenSet = JSON.parse(tokens)
      console.log('Loaded tokenSet from file:', {
        access_token: tokenSet.access_token,
        refresh_token: tokenSet.refresh_token,
        expires_at: tokenSet.expires_at,
        tenantId: tokenSet.tenantId
      })
    } catch (error) {
      throw new Error(
        'No valid tokens found. Set XERO_TOKEN_SET in production or authenticate with Xero locally.'
      )
    }
  }

  xero.setTokenSet(tokenSet)

  const expiryThreshold = 5 * 60 * 1000 // 5 minutes in milliseconds
  if (Date.now() > (tokenSet.expires_at ?? 0) * 1000 - expiryThreshold) {
    console.log('Refreshing token due to impending expiry...')
    const newTokenSet = await xero.refreshToken()
    ;(newTokenSet as TokenSet & { tenantId: string }).tenantId =
      tokenSet.tenantId // Preserve tenantId
    console.log('Refreshed tokenSet:', {
      access_token: newTokenSet.access_token,
      refresh_token: newTokenSet.refresh_token,
      expires_at: newTokenSet.expires_at,
      tenantId: newTokenSet.tenantId
    })
    await saveTokenSet(newTokenSet)
    xero.setTokenSet(newTokenSet)
    tokenSet = newTokenSet as TokenSet & { tenantId: string }
  }

  return tokenSet
}

export async function saveTokenSet(tokenSet: TokenSet & { tenantId?: string }) {
  const tokenData = {
    access_token: tokenSet.access_token,
    refresh_token: tokenSet.refresh_token,
    expires_at: tokenSet.expires_at,
    tenantId: tokenSet.tenantId
  }
  if (process.env.NODE_ENV === 'production') {
    console.log(
      'New token set (update XERO_TOKEN_SET in Vercel):',
      JSON.stringify(tokenData)
    )
  } else {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenData, null, 2))
  }
}

export default xero
