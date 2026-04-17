import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { sendMetaPurchase } from '../../../../lib/meta-capi'

/**
 * Shopify webhook → Meta Conversions API Purchase event.
 *
 * Waarom deze route bestaat: onze frontend (Next.js op earasers.shop) kan
 * géén Purchase event firen omdat de checkout op Shopify's hosted domain
 * plaatsvindt. Shopify's eigen Customer Events / Web Pixel / "Maximum data
 * sharing" werkt niet voor headless stores. Zonder deze route ziet Meta
 * geen enkele conversie → ads kunnen niet optimaliseren.
 *
 * Flow:
 * 1. User checkt uit → Shopify maakt de order aan.
 * 2. Shopify firet `orders/paid` webhook naar deze endpoint.
 * 3. We verifiëren de HMAC signature (voorkomt spoofing).
 * 4. We lezen Meta tracking cookies (fbp/fbc) uit `note_attributes`
 *    die door onze cart-flow zijn ingevuld vóór de redirect.
 * 5. We versturen een Purchase event via Meta CAPI met gehashte PII.
 *
 * Setup (handmatig in Shopify Admin):
 *   Settings → Notifications → Webhooks →
 *   Create webhook → Event: "Order payment" → Format: JSON → URL:
 *     https://www.earasers.shop/api/webhooks/shopify/order
 *   Noteer het "Webhook secret" (gedeeld over alle webhooks in de shop)
 *   en zet het als `SHOPIFY_WEBHOOK_SECRET` in Vercel env vars.
 *
 * Env vars:
 *   SHOPIFY_WEBHOOK_SECRET — HMAC shared secret (Shopify Admin)
 *   META_CAPI_TOKEN        — access token (Meta Events Manager → Settings)
 *   NEXT_PUBLIC_META_PIXEL_ID — bestaande pixel ID
 *   META_CAPI_TEST_EVENT_CODE — optioneel, voor Test Events in Events Manager
 */

// Next.js parseert body als JSON tenzij we dit uitzetten — voor HMAC-verify
// hebben we de EXACTE raw bytes nodig (een re-serialized JSON heeft niet
// hetzelfde hash).
export const config = {
  api: { bodyParser: false },
}

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

function verifyHmac(raw: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature) return false
  const digest = crypto.createHmac('sha256', secret).update(raw).digest('base64')
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

type ShopifyNoteAttribute = { name: string; value: string }
type ShopifyLineItem = { variant_id: number; quantity: number; product_id: number }
type ShopifyCustomer = { email?: string; first_name?: string; last_name?: string; phone?: string }
type ShopifyShippingAddress = { city?: string; country_code?: string; zip?: string }
type ShopifyClientDetails = { browser_ip?: string; user_agent?: string }
type ShopifyOrder = {
  id: number
  name: string
  email?: string
  phone?: string
  currency: string
  total_price: string
  order_status_url?: string
  created_at: string
  processed_at?: string
  note_attributes?: ShopifyNoteAttribute[]
  line_items?: ShopifyLineItem[]
  customer?: ShopifyCustomer
  shipping_address?: ShopifyShippingAddress
  billing_address?: ShopifyShippingAddress
  client_details?: ShopifyClientDetails
}

function findAttr(attrs: ShopifyNoteAttribute[] | undefined, key: string): string | undefined {
  return attrs?.find(a => a.name === key)?.value
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[webhook/order] SHOPIFY_WEBHOOK_SECRET not set')
    // 200 om Shopify retries te voorkomen; zonder secret kan er toch niks
    // geverifieerd worden en retries lossen dat niet op.
    return res.status(200).json({ ok: false, reason: 'not_configured' })
  }

  const raw = await readRawBody(req)
  const signature = req.headers['x-shopify-hmac-sha256']
  const sig = Array.isArray(signature) ? signature[0] : signature

  if (!verifyHmac(raw, sig, secret)) {
    console.warn('[webhook/order] HMAC verification failed')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  let order: ShopifyOrder
  try {
    order = JSON.parse(raw.toString('utf8')) as ShopifyOrder
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  const fbp           = findAttr(order.note_attributes, '_meta_fbp')
  const fbc           = findAttr(order.note_attributes, '_meta_fbc')
  const sourceUrl     = findAttr(order.note_attributes, '_meta_source_url')
  const userAgentAttr = findAttr(order.note_attributes, '_meta_user_agent')

  // Fallback: als de browser cookies er niet in zitten (bv. oude cart van
  // voor deze fix, of user heeft cookies geblokkeerd) stuur het Purchase
  // event alsnog — Meta matching werkt dan alleen op email/IP/UA. Beter
  // dan niks versturen.
  const customer = order.customer ?? {}
  const ship     = order.shipping_address ?? order.billing_address ?? {}
  const client   = order.client_details ?? {}

  const contentIds = Array.from(new Set(
    (order.line_items ?? []).map(l => `gid://shopify/ProductVariant/${l.variant_id}`),
  ))
  const numItems = (order.line_items ?? []).reduce((s, l) => s + l.quantity, 0)

  const eventTime = Math.floor(new Date(order.processed_at ?? order.created_at).getTime() / 1000)

  const result = await sendMetaPurchase({
    eventId:        `order-${order.id}`,
    eventTime:      Number.isFinite(eventTime) ? eventTime : Math.floor(Date.now() / 1000),
    eventSourceUrl: sourceUrl ?? order.order_status_url ?? 'https://www.earasers.shop/',
    value:          parseFloat(order.total_price),
    currency:       order.currency,
    orderId:        String(order.id),
    contentIds,
    numItems,
    user: {
      email:     order.email ?? customer.email,
      phone:     order.phone ?? customer.phone,
      firstName: customer.first_name,
      lastName:  customer.last_name,
      city:      ship.city,
      country:   ship.country_code,
      zip:       ship.zip,
      fbp,
      fbc,
      clientIp:  client.browser_ip,
      userAgent: userAgentAttr ?? client.user_agent,
    },
  })

  if (!result.ok) {
    console.error('[webhook/order] Meta CAPI failed:', result.error)
    // 200 zodat Shopify niet 48 uur lang retryt — we hebben het geprobeerd
    // en het logpad geeft genoeg informatie om te debuggen. Retries helpen
    // niet bij een config-probleem (verkeerde token, etc).
    return res.status(200).json({ ok: false, error: result.error })
  }

  return res.status(200).json({ ok: true, orderId: order.id })
}
