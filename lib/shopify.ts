if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not set')
}
if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN is not set')
}

const DOMAIN  = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const TOKEN   = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
const API_URL = `https://${DOMAIN}/api/2024-01/graphql.json`

const MAX_ATTEMPTS = 3       // 1 initial + 2 retries
const BASE_BACKOFF = 200     // ms — 200, 600 (exp factor 3, snel onder Vercel 10s budget)
const MAX_BACKOFF  = 1500    // ms — cap zodat een retry niet ons hele budget opvreet

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/** Bepaalt of een fout safe is om te retryen (transient netwerk / throttle / 5xx). */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500
}

function backoffMs(attempt: number, retryAfterSec?: number): number {
  if (retryAfterSec && retryAfterSec > 0) {
    return Math.min(MAX_BACKOFF, retryAfterSec * 1000)
  }
  // Exponentieel met jitter: 200ms, 600ms, 1800ms (capped op MAX_BACKOFF)
  const exp = BASE_BACKOFF * Math.pow(3, attempt)
  const jitter = Math.random() * 100
  return Math.min(MAX_BACKOFF, exp + jitter)
}

/**
 * GraphQL-laag throttling. Shopify Storefront API kan een 200 OK terugsturen
 * met een `THROTTLED` error in de body i.p.v. een 429 — vooral bij high-volume
 * Storefront tokens. We checken hier expliciet op die error code.
 */
function isGraphqlThrottled(errors: Array<{ message?: string; extensions?: { code?: string } }>): boolean {
  return errors.some(e => e?.extensions?.code === 'THROTTLED' || /throttled/i.test(e?.message ?? ''))
}

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  let lastErr: unknown

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    // 8s timeout per attempt: veilig onder Vercel Hobby plan's 10s serverless limit.
    const timeout = setTimeout(() => controller.abort(), 8_000)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': TOKEN,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      })

      if (!res.ok) {
        if (isRetryableStatus(res.status) && attempt < MAX_ATTEMPTS - 1) {
          const ra = parseInt(res.headers.get('retry-after') ?? '', 10)
          await sleep(backoffMs(attempt, Number.isFinite(ra) ? ra : undefined))
          lastErr = new Error(`Shopify API error: ${res.status}`)
          continue
        }
        throw new Error(`Shopify API error: ${res.status}`)
      }

      const json = await res.json()
      if (json.errors?.length) {
        if (isGraphqlThrottled(json.errors) && attempt < MAX_ATTEMPTS - 1) {
          await sleep(backoffMs(attempt))
          lastErr = new Error(json.errors[0].message)
          continue
        }
        throw new Error(json.errors[0].message)
      }

      return json.data as T
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      const isNetwork = err instanceof TypeError // fetch() network failures
      if ((isAbort || isNetwork) && attempt < MAX_ATTEMPTS - 1) {
        await sleep(backoffMs(attempt))
        lastErr = isAbort
          ? new Error('Shopify API timeout — request took longer than 8 seconds')
          : err
        continue
      }
      if (isAbort) {
        throw new Error('Shopify API timeout — request took longer than 8 seconds')
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastErr ?? new Error('Shopify API failed after retries')
}
