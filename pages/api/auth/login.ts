import type { NextApiRequest, NextApiResponse } from 'next'
import { shopifyFetch } from '../../../lib/shopify'
import { serializeCookie } from '../../../lib/cookies'
import { rateLimit } from '../../../lib/rate-limit'
import { checkOrigin } from '../../../lib/csrf'

type TokenCreateResponse = {
  customerAccessTokenCreate: {
    customerAccessToken: { accessToken: string; expiresAt: string } | null
    customerUserErrors: Array<{ message: string }>
  }
}

type CustomerResponse = {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    acceptsMarketing: boolean
  } | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkOrigin(req, res)) return

  // Max 10 login-pogingen per IP per minuut — mitigeert credential stuffing
  if (!(await rateLimit(req, res, { limit: 10, windowMs: 60_000, name: 'auth-login' }))) return

  const body = req.body as { email?: unknown; password?: unknown }
  const email    = typeof body?.email    === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' })
  }
  if (!password || password.length < 1 || password.length > 256) {
    return res.status(400).json({ error: 'Invalid password' })
  }

  try {
    const data = await shopifyFetch<TokenCreateResponse>(`
      mutation CustomerLogin($email: String!, $password: String!) {
        customerAccessTokenCreate(input: { email: $email, password: $password }) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors  { message }
        }
      }
    `, { email, password })

    const result = data.customerAccessTokenCreate
    if (result.customerUserErrors.length > 0) {
      return res.status(401).json({ error: result.customerUserErrors[0].message })
    }

    const accessToken = result.customerAccessToken?.accessToken
    const expiresAt   = result.customerAccessToken?.expiresAt
    if (!accessToken) return res.status(401).json({ error: 'Login mislukt. Probeer opnieuw.' })

    // Haal klantgegevens op
    const customerData = await shopifyFetch<CustomerResponse>(`
      query CustomerData($token: String!) {
        customer(customerAccessToken: $token) {
          id firstName lastName email acceptsMarketing
        }
      }
    `, { token: accessToken })

    const customer = customerData.customer
    if (!customer) return res.status(500).json({ error: 'Klantgegevens konden niet worden opgehaald.' })

    const maxAgeMs = expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0
    const maxAge = Math.max(60, Math.min(60 * 60 * 24 * 30, Math.floor(maxAgeMs / 1000)))

    res.setHeader('Set-Cookie', serializeCookie('storefront_token', accessToken, { maxAge }))
    return res.status(200).json({
      user: {
        id:               customer.id,
        firstName:        customer.firstName,
        lastName:         customer.lastName,
        email:            customer.email,
        acceptsMarketing: customer.acceptsMarketing,
      },
    })
  } catch (err) {
    console.error('[api/auth/login] Shopify error:', err)
    return res.status(502).json({ error: 'Er is een fout opgetreden. Probeer het opnieuw.' })
  }
}
