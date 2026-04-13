import type { NextApiRequest, NextApiResponse } from 'next'
import { getCollectionProducts, filterFbtAccessories } from '../../lib/products'
import { rateLimit } from '../../lib/rate-limit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Max 60 requests per IP per minuut — ruim genoeg voor normale client fallback
  if (!(await rateLimit(req, res, { limit: 60, windowMs: 60_000, name: 'accessories' }))) return

  try {
    const all = await getCollectionProducts('accessories')
    const filtered = filterFbtAccessories(all)
    // 5 min browser cache — accessories veranderen zelden
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
    res.status(200).json(filtered)
  } catch {
    res.status(200).json([])
  }
}
