/**
 * Unified customer data fetcher dat beide auth-flows ondersteunt:
 *   - OAuth via Customer Account API (cookie: customer_token)  → moderne Shopify login
 *   - Email/password via Storefront API (cookie: storefront_token) → bestaande gebruikers
 *
 * Probeert eerst OAuth (rijkere data met orders), valt terug op Storefront.
 * Dit zorgt dat beide login-methodes naar dezelfde /account pagina leiden.
 */

import { getCustomerWithOrders, type CustomerProfile, type CustomerOrder } from './customer-api'
import { shopifyFetch } from './shopify'
import { getCookie } from './cookies'

export type UnifiedCustomer = {
  id: string
  firstName: string
  lastName: string
  email: string
  orders: CustomerOrder[]
  /** Welke auth-bron deze data opleverde — handig voor logout-flow */
  authType: 'oauth' | 'storefront'
}

type StorefrontLineItem = {
  title: string
  quantity: number
  variant: {
    image: { url: string; altText: string | null } | null
    price: { amount: string; currencyCode: string }
  } | null
}

type StorefrontOrder = {
  id: string
  name: string
  processedAt: string
  financialStatus: string | null
  fulfillmentStatus: string
  totalPrice: { amount: string; currencyCode: string }
  lineItems: {
    edges: Array<{ node: StorefrontLineItem }>
  }
}

type StorefrontCustomerResponse = {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    orders: {
      edges: Array<{ node: StorefrontOrder }>
    }
  } | null
}

async function fetchStorefrontCustomer(token: string): Promise<UnifiedCustomer | null> {
  try {
    const data = await shopifyFetch<StorefrontCustomerResponse>(`
      query StorefrontCustomer($token: String!) {
        customer(customerAccessToken: $token) {
          id
          firstName
          lastName
          email
          orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                name
                processedAt
                financialStatus
                fulfillmentStatus
                totalPrice { amount currencyCode }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
                        image { url altText }
                        price { amount currencyCode }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `, { token })

    const c = data.customer
    if (!c) return null

    // Normaliseer Storefront API structuur naar CustomerOrder shape (flat image/price)
    const orders: CustomerOrder[] = c.orders.edges.map(({ node }) => ({
      id: node.id,
      name: node.name,
      processedAt: node.processedAt,
      financialStatus: node.financialStatus ?? 'UNKNOWN',
      fulfillmentStatus: node.fulfillmentStatus,
      totalPrice: node.totalPrice,
      lineItems: {
        edges: node.lineItems.edges.map(({ node: li }) => ({
          node: {
            title:    li.title,
            quantity: li.quantity,
            image:    li.variant?.image ?? null,
            price:    li.variant?.price ?? { amount: '0', currencyCode: node.totalPrice.currencyCode },
          },
        })),
      },
    }))

    return {
      id:        c.id,
      firstName: c.firstName,
      lastName:  c.lastName,
      email:     c.email,
      orders,
      authType:  'storefront',
    }
  } catch (err) {
    console.error('[unified-customer] Storefront fetch failed:', err)
    return null
  }
}

async function fetchOauthCustomer(token: string): Promise<UnifiedCustomer | null> {
  try {
    const c = await getCustomerWithOrders(token)
    if (!c) return null
    return {
      id:        c.id,
      firstName: c.firstName,
      lastName:  c.lastName,
      email:     c.emailAddress.emailAddress,
      orders:    c.orders.edges.map(e => e.node),
      authType:  'oauth',
    }
  } catch (err) {
    console.error('[unified-customer] OAuth fetch failed:', err)
    return null
  }
}

/**
 * Probeert klantgegevens op te halen via OAuth eerst, dan Storefront.
 * Returnt null als geen enkele token geldig is.
 */
export async function getUnifiedCustomer(cookieHeader: string | undefined): Promise<UnifiedCustomer | null> {
  const oauthToken      = getCookie(cookieHeader, 'customer_token')
  const storefrontToken = getCookie(cookieHeader, 'storefront_token')

  if (oauthToken) {
    const customer = await fetchOauthCustomer(oauthToken)
    if (customer) return customer
  }

  if (storefrontToken) {
    const customer = await fetchStorefrontCustomer(storefrontToken)
    if (customer) return customer
  }

  return null
}

export type { CustomerProfile, CustomerOrder }
