import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verwijder de httpOnly customer_token cookie
  res.setHeader(
    'Set-Cookie',
    'customer_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
  )
  return res.status(200).json({ ok: true })
}
