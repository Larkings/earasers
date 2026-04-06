const DOMAIN  = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const TOKEN   = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!
const API_URL = `https://${DOMAIN}/api/2024-01/graphql.json`

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)

  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)

  return json.data as T
}
