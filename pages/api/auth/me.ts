import type { NextApiRequest, NextApiResponse } from 'next'
import { shopifyFetch } from '../../../lib/shopify'
import { getCookie, clearCookie } from '../../../lib/cookies'

type CustomerResponse = {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    acceptsMarketing: boolean
  } | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  // Alleen de Storefront-token wordt hier gebruikt (email/password flow).
  // De OAuth `customer_token` cookie is voor de Customer Account API op /account.
  const token = getCookie(req.headers.cookie, 'storefront_token')
  if (!token) return res.status(200).json({ user: null })

  try {
    const data = await shopifyFetch<CustomerResponse>(`
      query CustomerData($token: String!) {
        customer(customerAccessToken: $token) {
          id firstName lastName email acceptsMarketing
        }
      }
    `, { token })

    const customer = data.customer
    if (!customer) {
      // Token is ongeldig/verlopen — wis cookie
      res.setHeader('Set-Cookie', clearCookie('storefront_token'))
      return res.status(200).json({ user: null })
    }

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
    console.error('[api/auth/me] Shopify error:', err)
    return res.status(502).json({ user: null, error: 'Kon klantgegevens niet ophalen' })
  }
}
