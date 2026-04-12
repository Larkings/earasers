if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not set')
}
if (!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN is not set')
}

const DOMAIN  = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const TOKEN   = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
const API_URL = `https://${DOMAIN}/api/2024-01/graphql.json`

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

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

    if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)

    const json = await res.json()
    if (json.errors?.length) throw new Error(json.errors[0].message)

    return json.data as T
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Shopify API timeout — request took longer than 15 seconds')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
