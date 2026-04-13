import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Rate limiter met sliding window. Gebruikt Upstash Redis (REST API) als
 * `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` zijn geconfigureerd —
 * dat geeft cross-instance bescherming op Vercel serverless. Anders fallback
 * naar in-memory per-instance bucket (single-instance bescherming).
 *
 * Onder piek (Black Friday): zonder Upstash kan een attacker requests over
 * meerdere warm instances spreiden en de limiet effectief omzeilen. Met
 * Upstash is de limiet écht globaal.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

let cleanupTimer: NodeJS.Timeout | null = null
function scheduleCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key)
    }
  }, 60_000)
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
  limit: number
  windowMs: number
  name: string
}

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * Upstash pipeline: INCR + PEXPIRE NX. Returnt {count, resetMs} of null bij fout.
 * NX zorgt dat de TTL alleen wordt gezet bij de eerste increment van het window —
 * dat geeft een echte fixed-window limit i.p.v. een rolling expire.
 */
async function upstashIncrement(
  key: string,
  windowMs: number,
): Promise<{ count: number; ttlMs: number } | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
      body: JSON.stringify([
        ['INCR', key],
        ['PEXPIRE', key, String(windowMs), 'NX'],
        ['PTTL', key],
      ]),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) return null
    const json = (await res.json()) as Array<{ result?: number; error?: string }>
    if (!Array.isArray(json) || json.length < 3) return null
    const count = typeof json[0]?.result === 'number' ? json[0].result : null
    const ttl   = typeof json[2]?.result === 'number' ? json[2].result : null
    if (count === null) return null
    // PTTL kan -1 (geen TTL) of -2 (key bestaat niet meer) returnen; in beide
    // gevallen vallen we terug op het volledige window.
    const ttlMs = ttl !== null && ttl > 0 ? ttl : windowMs
    return { count, ttlMs }
  } catch {
    return null
  }
}

export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  opts: RateLimitOptions,
): Promise<boolean> {
  const ip = getClientIp(req)
  const key = `rl:${opts.name}:${ip}`
  const now = Date.now()

  let count: number
  let resetAt: number

  const upstash = await upstashIncrement(key, opts.windowMs)
  if (upstash) {
    count   = upstash.count
    resetAt = now + upstash.ttlMs
  } else {
    // Fallback: in-memory per instance
    scheduleCleanup()
    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + opts.windowMs }
      buckets.set(key, bucket)
    }
    bucket.count += 1
    count   = bucket.count
    resetAt = bucket.resetAt
  }

  const remaining = Math.max(0, opts.limit - count)
  res.setHeader('X-RateLimit-Limit', String(opts.limit))
  res.setHeader('X-RateLimit-Remaining', String(remaining))
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))

  if (count > opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000))
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({ error: 'Too many requests. Probeer het later opnieuw.' })
    return false
  }

  return true
}
