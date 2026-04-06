const CUSTOMER_API =
  'https://shopify.com/authentication/25467387989/account/customer/api/2024-10/graphql'

async function customerFetch<T>(query: string, token: string): Promise<T> {
  const res = await fetch(CUSTOMER_API, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`Customer API error: ${res.status}`)
  return res.json() as Promise<T>
}

export type CustomerOrder = {
  id: string
  name: string
  processedAt: string
  financialStatus: string
  fulfillmentStatus: string
  totalPrice: { amount: string; currencyCode: string }
  lineItems: {
    edges: Array<{
      node: {
        title:    string
        quantity: number
        image:    { url: string; altText: string } | null
        price:    { amount: string; currencyCode: string }
      }
    }>
  }
}

export type CustomerProfile = {
  id: string
  firstName: string
  lastName: string
  emailAddress: { emailAddress: string }
  orders: { edges: Array<{ node: CustomerOrder }> }
}

type CustomerResponse = {
  data: { customer: CustomerProfile } | null
  errors?: Array<{ message: string }>
}

export async function getCustomerWithOrders(token: string): Promise<CustomerProfile | null> {
  const res = await customerFetch<CustomerResponse>(`{
    customer {
      id
      firstName
      lastName
      emailAddress { emailAddress }
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
                  image { url altText }
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  }`, token)

  return res.data?.customer ?? null
}
