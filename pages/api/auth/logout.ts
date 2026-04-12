import type { NextApiRequest, NextApiResponse } from 'next'
import { shopifyFetch } from '../../../lib/shopify'
import { getCookie, clearCookie } from '../../../lib/cookies'
import { checkOrigin } from '../../../lib/csrf'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkOrigin(req, res)) return

  const storefrontToken = getCookie(req.headers.cookie, 'storefront_token')
  const customerToken   = getCookie(req.headers.cookie, 'customer_token')

  // Verwijder beide cookies (altijd, ook als revoke faalt)
  res.setHeader('Set-Cookie', [
    clearCookie('storefront_token'),
    clearCookie('customer_token'),
  ])

  // Storefront-token intrekken bij Shopify (best-effort)
  if (storefrontToken) {
    try {
      await shopifyFetch<unknown>(`
        mutation CustomerLogout($token: String!) {
          customerAccessTokenDelete(customerAccessToken: $token) {
            deletedAccessToken
          }
        }
      `, { token: storefrontToken })
    } catch (err) {
      console.warn('[api/auth/logout] Shopify revoke failed (cookies still cleared):', err)
    }
  }
  // Customer Account API (OAuth) tokens worden ingetrokken via Shopify's logout URL
  // vanuit de client (lib/customer-auth.ts). We ruimen hier alleen de cookie op.
  void customerToken

  return res.status(200).json({ ok: true })
}
