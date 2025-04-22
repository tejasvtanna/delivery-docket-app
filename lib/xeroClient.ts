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
  // scopes: ['accounting.contacts.read', 'offline_access']
  scopes: [
    'accounting.transactions',
    'accounting.contacts.read',
    'offline_access'
  ] // Added accounting.transactions
})

export async function getTokenSet(): Promise<TokenSet & { tenantId: string }> {
  try {
    const tokens = await fs.readFile(TOKEN_PATH, 'utf-8')
    const tokenSet = JSON.parse(tokens)
    xero.setTokenSet(tokenSet)

    if (Date.now() > tokenSet.expires_at * 1000) {
      const newTokenSet = await xero.refreshToken()
      await saveTokenSet(newTokenSet)
      xero.setTokenSet(newTokenSet)
      return newTokenSet as TokenSet & { tenantId: string }
    }

    return tokenSet
  } catch (error) {
    throw new Error('No valid tokens found. Please authenticate with Xero.')
  }
}

export async function saveTokenSet(tokenSet: TokenSet & { tenantId?: string }) {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokenSet, null, 2))
}

export default xero
