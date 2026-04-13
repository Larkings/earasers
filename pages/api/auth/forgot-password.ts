import type { NextApiRequest, NextApiResponse } from 'next'
import { shopifyFetch } from '../../../lib/shopify'
import { rateLimit } from '../../../lib/rate-limit'
import { checkOrigin } from '../../../lib/csrf'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkOrigin(req, res)) return

  // Max 3 resets per IP per 10 min
  if (!(await rateLimit(req, res, { limit: 3, windowMs: 10 * 60_000, name: 'auth-forgot' }))) return

  const body = req.body as { email?: unknown }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  try {
    await shopifyFetch<unknown>(`
      mutation CustomerRecover($email: String!) {
        customerRecover(email: $email) {
          customerUserErrors { message }
        }
      }
    `, { email })
    // Altijd 200 — geen account enumeration (vertel niet of email bestond)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[api/auth/forgot-password] Shopify error:', err)
    return res.status(502).json({ error: 'Er is een fout opgetreden. Probeer het opnieuw.' })
  }
}
