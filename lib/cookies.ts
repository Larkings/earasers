/**
 * Server-side cookie helpers voor Next.js API routes en getServerSideProps.
 */

export function getCookie(cookieHeader: string | undefined | null, name: string): string | null {
  if (!cookieHeader) return null
  const found = cookieHeader.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${name}=`))
  if (!found) return null
  return decodeURIComponent(found.slice(name.length + 1))
}

type CookieOptions = {
  maxAge?: number
  path?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

export function serializeCookie(name: string, value: string, opts: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  if (opts.httpOnly !== false) parts.push('HttpOnly')
  if (opts.secure !== false)   parts.push('Secure')
  parts.push(`SameSite=${opts.sameSite ?? 'Lax'}`)
  parts.push(`Path=${opts.path ?? '/'}`)
  if (typeof opts.maxAge === 'number') parts.push(`Max-Age=${Math.floor(opts.maxAge)}`)
  return parts.join('; ')
}

export function clearCookie(name: string): string {
  return serializeCookie(name, '', { maxAge: 0 })
}
