/**
 * In-memory cache met TTL + in-flight promise dedup voor read-only Shopify
 * queries. Doel: onder piek (Black Friday) niet 1000 identieke GraphQL calls
 * doen voor hetzelfde product, maar er één — de andere 999 awaiten dezelfde
 * promise of lezen uit cache.
 *
 * Schaal: per Vercel serverless instance. Niet cross-instance — voor échte
 * globale dedup zou je een edge KV nodig hebben. In de praktijk is per-instance
 * dedup al genoeg om Shopify API quota te beschermen, omdat Vercel binnen één
 * instance honderden parallel requests serveert.
 *
 * Mutations (cart, login) gebruiken deze cache NIET — die roepen `shopifyFetch`
 * direct aan.
 */

type Entry<T> = { value: T; expiresAt: number }

const cache = new Map<string, Entry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

const DEFAULT_TTL_MS = 60_000 // 1 min

let cleanupTimer: NodeJS.Timeout | null = null
function scheduleCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of cache) {
      if (entry.expiresAt < now) cache.delete(key)
    }
  }, 60_000)
  if (cleanupTimer.unref) cleanupTimer.unref()
}

export async function cachedRead<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  scheduleCleanup()

  const now = Date.now()
  const hit = cache.get(key) as Entry<T> | undefined
  if (hit && hit.expiresAt > now) return hit.value

  // In-flight dedup: als een andere request al fetcht, wacht op die promise.
  const pending = inflight.get(key) as Promise<T> | undefined
  if (pending) return pending

  const promise = (async () => {
    try {
      const value = await fetcher()
      cache.set(key, { value, expiresAt: Date.now() + ttlMs })
      return value
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, promise)
  return promise
}

/** Test-only / handmatige cache-invalidatie. */
export function clearShopifyCache(): void {
  cache.clear()
  inflight.clear()
}
