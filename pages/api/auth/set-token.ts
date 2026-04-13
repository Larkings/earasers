import type {NextApiRequest, NextApiResponse} from 'next'
import { rateLimit } from '../../../lib/rate-limit'
import { checkOrigin } from '../../../lib/csrf'

// Shopify customer access tokens zijn base64-encoded strings (typisch 32-512 chars).
// Deze regex accepteert alleen veilige karakters om header injection te voorkomen.
const TOKEN_PATTERN = /^[A-Za-z0-9._\-]{16,1024}$/
const MAX_EXPIRES_IN = 60 * 60 * 24 * 30 // 30 dagen
const DEFAULT_EXPIRES_IN = 60 * 60 * 24 // 1 dag

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkOrigin(req, res)) return

  // Max 20 set-token calls per IP per 5 min — legitieme OAuth callbacks komen 1×
  if (!(await rateLimit(req, res, { limit: 20, windowMs: 5 * 60_000, name: 'auth-set-token' }))) return

  const body = req.body as { access_token?: unknown; expires_in?: unknown }
  const access_token = typeof body?.access_token === 'string' ? body.access_token : ''
  const rawExpires = typeof body?.expires_in === 'number' ? body.expires_in : DEFAULT_EXPIRES_IN

  if (!access_token) return res.status(400).json({ error: 'Missing access_token' })
  if (!TOKEN_PATTERN.test(access_token)) {
    return res.status(400).json({ error: 'Invalid access_token format' })
  }

  const expires_in = Math.max(60, Math.min(MAX_EXPIRES_IN, Math.floor(rawExpires)))

  const cookie = [
    `customer_token=${access_token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${expires_in}`,
    'Path=/',
  ].join('; ')

  res.setHeader('Set-Cookie', cookie)
  return res.status(200).json({ ok: true })
}
