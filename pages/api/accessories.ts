import type { NextApiRequest, NextApiResponse } from 'next'
import { getCollectionProducts, filterFbtAccessories } from '../../lib/products'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const all = await getCollectionProducts('accessories')
    const filtered = filterFbtAccessories(all)
    res.status(200).json(filtered)
  } catch {
    res.status(200).json([])
  }
}
