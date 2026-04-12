import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * CSRF-bescherming via Origin/Referer header check.
 *
 * Voor mutation endpoints (POST/PUT/DELETE): de request moet afkomstig zijn
 * van onze eigen origin. Dit is een extra laag bovenop SameSite=Lax cookies.
 *
 * Toegestane origins worden afgeleid van:
 *   - NEXT_PUBLIC_APP_URL (production)
 *   - request host (voor preview deployments en localhost)
 */

function isAllowedOrigin(req: NextApiRequest, origin: string): boolean {
  try {
    const originUrl = new URL(origin)

    // Development: sta localhost + 127.0.0.1 toe
    if (process.env.NODE_ENV !== 'production') {
      if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
        return true
      }
    }

    // Match tegen request host (Vercel preview URLs, custom domains)
    const host = req.headers.host
    if (host && originUrl.host === host) return true

    // Match tegen geconfigureerde public URL
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL
    if (publicUrl) {
      try {
        const allowedUrl = new URL(publicUrl)
        if (originUrl.host === allowedUrl.host) return true
      } catch {}
    }

    return false
  } catch {
    return false
  }
}

/**
 * Retourneert `true` als de request mag doorgaan.
 * Zet 403 response en retourneert `false` als Origin mismatch.
 */
export function checkOrigin(req: NextApiRequest, res: NextApiResponse): boolean {
  // Alleen mutations checken — GET/HEAD zijn safe
  const method = req.method ?? 'GET'
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true

  const origin  = req.headers.origin
  const referer = req.headers.referer

  // Strict: moet Origin of Referer hebben
  const source = origin || referer
  if (!source) {
    res.status(403).json({ error: 'Missing origin' })
    return false
  }

  if (!isAllowedOrigin(req, source)) {
    res.status(403).json({ error: 'Origin not allowed' })
    return false
  }

  return true
}
