import type { NextApiRequest, NextApiResponse } from 'next'
import { getCollectionProducts, filterFbtAccessories } from '../../lib/products'
import { rateLimit } from '../../lib/rate-limit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Max 60 requests per IP per minuut — ruim genoeg voor normale client fallback
  if (!(await rateLimit(req, res, { limit: 60, windowMs: 60_000, name: 'accessories' }))) return

  try {
    // Locale uit query string (fallback 'en'). Frontend fetch stuurt deze mee
    // zodat accessory titles matchen met de gebruikers-taal.
    const locale = typeof req.query.locale === 'string' ? req.query.locale : 'en'
    const all = await getCollectionProducts('accessories', locale)
    // `?all=1` returns de volledige collectie (voor de zoekbalk-index).
    // Default is de krappe FBT-subset voor de frequently-bought-together UI.
    const includeAll = req.query.all === '1' || req.query.all === 'true'
    const items = includeAll ? all : filterFbtAccessories(all)
    // 5 min browser cache — accessories veranderen zelden
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
    res.status(200).json(items)
  } catch {
    res.status(200).json([])
  }
}
