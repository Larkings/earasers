import type { NextApiRequest, NextApiResponse } from 'next'
import { shopifyFetch } from '../../../lib/shopify'
import { serializeCookie } from '../../../lib/cookies'
import { rateLimit } from '../../../lib/rate-limit'
import { checkOrigin } from '../../../lib/csrf'

type CustomerCreateResponse = {
  customerCreate: {
    customer: { id: string } | null
    customerUserErrors: Array<{ message: string }>
  }
}

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
const NAME_RE  = /^[\p{L}\p{M}\s'\-.]{1,80}$/u

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkOrigin(req, res)) return

  // Max 5 registraties per IP per 15 min — mitigeert spam-accounts
  if (!rateLimit(req, res, { limit: 5, windowMs: 15 * 60_000, name: 'auth-register' })) return

  const body = req.body as {
    firstName?: unknown
    lastName?: unknown
    email?: unknown
    password?: unknown
    acceptsMarketing?: unknown
  }

  const firstName        = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
  const lastName         = typeof body?.lastName  === 'string' ? body.lastName.trim()  : ''
  const email            = typeof body?.email     === 'string' ? body.email.trim().toLowerCase() : ''
  const password         = typeof body?.password  === 'string' ? body.password : ''
  const acceptsMarketing = Boolean(body?.acceptsMarketing)

  if (!firstName || !NAME_RE.test(firstName)) return res.status(400).json({ error: 'Invalid firstName' })
  if (!lastName  || !NAME_RE.test(lastName))  return res.status(400).json({ error: 'Invalid lastName' })
  if (!email     || !EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: 'Invalid email' })
  if (!password  || password.length < 6 || password.length > 256) return res.status(400).json({ error: 'Wachtwoord moet minimaal 6 tekens zijn' })

  try {
    const createResult = await shopifyFetch<CustomerCreateResponse>(`
      mutation CustomerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer { id }
          customerUserErrors { message }
        }
      }
    `, {
      input: { firstName, lastName, email, password, acceptsMarketing },
    })

    const { customerCreate } = createResult
    if (customerCreate.customerUserErrors.length > 0) {
      return res.status(400).json({ error: customerCreate.customerUserErrors[0].message })
    }
    if (!customerCreate.customer) {
      return res.status(500).json({ error: 'Account aanmaken mislukt.' })
    }

    // Direct inloggen na registratie
    const tokenResult = await shopifyFetch<TokenCreateResponse>(`
      mutation CustomerLogin($email: String!, $password: String!) {
        customerAccessTokenCreate(input: { email: $email, password: $password }) {
          customerAccessToken { accessToken expiresAt }
          customerUserErrors  { message }
        }
      }
    `, { email, password })

    const tokenData = tokenResult.customerAccessTokenCreate
    if (tokenData.customerUserErrors.length > 0 || !tokenData.customerAccessToken) {
      return res.status(500).json({ error: 'Account aangemaakt, maar inloggen mislukt. Probeer handmatig in te loggen.' })
    }

    const accessToken = tokenData.customerAccessToken.accessToken
    const expiresAt   = tokenData.customerAccessToken.expiresAt

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
    console.error('[api/auth/register] Shopify error:', err)
    return res.status(502).json({ error: 'Er is een fout opgetreden. Probeer het opnieuw.' })
  }
}
