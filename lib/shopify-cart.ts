import { shopifyFetch } from './shopify'

export type ShopifyCart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    totalAmount: { amount: string; currencyCode: string }
    subtotalAmount: { amount: string; currencyCode: string }
  }
  lines: {
    edges: Array<{
      node: {
        id: string
        quantity: number
        cost: { totalAmount: { amount: string; currencyCode: string } }
        merchandise: {
          id: string
          title: string
          price: { amount: string; currencyCode: string }
          product: {
            title: string
            handle: string
            images: { edges: Array<{ node: { url: string } }> }
          }
          selectedOptions: Array<{ name: string; value: string }>
        }
      }
    }>
  }
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount    { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              product {
                title
                handle
                images(first: 1) { edges { node { url } } }
              }
              selectedOptions { name value }
            }
          }
        }
      }
    }
  }
`

export async function createCart(): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(`
    mutation {
      cartCreate(input: { buyerIdentity: { countryCode: NL } }) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}
  `)
  return data.cartCreate.cart
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(`
    query Cart($cartId: ID!) { cart(id: $cartId) { ...CartFields } }
    ${CART_FRAGMENT}
  `, { cartId })
  return data.cart
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1,
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(`
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}
  `, { cartId, lines: [{ merchandiseId: variantId, quantity }] })
  return data.cartLinesAdd.cart
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(`
    mutation UpdateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}
  `, { cartId, lines: [{ id: lineId, quantity }] })
  return data.cartLinesUpdate.cart
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[],
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(`
    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
      }
    }
    ${CART_FRAGMENT}
  `, { cartId, lineIds })
  return data.cartLinesRemove.cart
}

/**
 * Maak een aparte directe checkout aan voor één variant.
 * Beïnvloedt de bestaande cart van de gebruiker NIET.
 * Geeft de checkoutUrl terug om direct naartoe te redirecten.
 */
export async function createDirectCheckout(
  variantId: string,
  quantity: number = 1,
): Promise<string> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart; userErrors: Array<{ message: string }> } }>(`
    mutation DirectCheckout($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines, buyerIdentity: { countryCode: NL } }) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }
  `, { lines: [{ merchandiseId: variantId, quantity }] })

  const checkoutUrl = data.cartCreate.cart?.checkoutUrl
  if (!checkoutUrl) throw new Error('Could not create direct checkout')
  return checkoutUrl
}
