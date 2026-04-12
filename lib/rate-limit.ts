import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Simpele IP-gebaseerde rate limiter met sliding window in-memory.
 *
 * Werkt voor één Node.js instance. Op Vercel (serverless) heeft elke warm
 * instance zijn eigen memory — niet perfect, maar biedt basis-bescherming
 * tegen burst-abuse van één client. Voor productie op schaal: Upstash Redis.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Periodieke opschoning om memory leaks te voorkomen
let cleanupTimer: NodeJS.Timeout | null = null
function scheduleCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key)
    }
  }, 60_000)
  // Zorg dat timer Node.js niet in leven houdt
  if (cleanupTimer.unref) cleanupTimer.unref()
}

export function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0].split(',')[0].trim()
  const real = req.headers['x-real-ip']
  if (typeof real === 'string') return real
  return req.socket?.remoteAddress ?? 'unknown'
}

export type RateLimitOptions = {
  /** Max requests binnen het window */
  limit: number
  /** Window in milliseconden */
  windowMs: number
  /** Unieke namespace voor de route (voorkomt cross-route leaks) */
  name: string
}

/**
 * Checkt of deze IP de limiet overschrijdt. Zet 429 + headers als dat zo is.
 * Returnt `true` als request doorgelaten moet worden, `false` als geblokkeerd.
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  opts: RateLimitOptions,
): boolean {
  scheduleCleanup()

  const ip = getClientIp(req)
  const key = `${opts.name}:${ip}`
  const now = Date.now()

  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + opts.windowMs }
    buckets.set(key, bucket)
  }

  bucket.count += 1
  const remaining = Math.max(0, opts.limit - bucket.count)

  res.setHeader('X-RateLimit-Limit', String(opts.limit))
  res.setHeader('X-RateLimit-Remaining', String(remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))

  if (bucket.count > opts.limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({ error: 'Too many requests. Probeer het later opnieuw.' })
    return false
  }

  return true
}
