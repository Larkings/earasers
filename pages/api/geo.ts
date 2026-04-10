import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vercel zet x-vercel-ip-country automatisch op elke request
  const country = (req.headers['x-vercel-ip-country'] as string)?.toUpperCase() ?? ''

  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.json({ country })
}
