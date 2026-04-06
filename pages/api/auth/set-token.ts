import type {NextApiRequest, NextApiResponse} from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { access_token, expires_in } = req.body as {
    access_token: string
    expires_in: number
  }

  if (!access_token) return res.status(400).json({ error: 'Missing access_token' })
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
