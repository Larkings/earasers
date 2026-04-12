import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory rate limit store (per serverless instantie)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

export function proxy(req: NextRequest) {
  // Alleen API routes beschermen
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const ip     = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now    = Date.now()
  const LIMIT  = 60           // max requests
  const WINDOW = 60 * 1000   // per minuut

  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.timestamp > WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return NextResponse.next()
  }

  if (entry.count >= LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  entry.count++
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
