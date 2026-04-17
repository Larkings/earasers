import crypto from 'crypto'

/**
 * Meta Conversions API — server-side Purchase event verzenden.
 *
 * Waarom: op een headless Shopify store zit de thank-you page op Shopify's
 * hosted checkout domain. Onze Next.js pixel kan daar geen Purchase event
 * firen, en Shopify's eigen Customer Events/Web Pixels worden niet
 * ondersteund voor headless stores (Shopify doc bevestigt dit). Resultaat:
 * Meta ziet nul conversies → ads kunnen niet optimaliseren → ROAS kelderen.
 *
 * Oplossing: Shopify webhook `orders/paid` → onze Next.js API route →
 * deze helper POSTen naar Meta CAPI. fbp/fbc cookies worden bij checkout
 * als cart-attribuut meegegeven zodat Meta de conversie kan matchen met
 * de originele ad-klik.
 *
 * Dedup: er wordt CLIENT-SIDE géén Purchase gefired (user zit op Shopify
 * domain), dus géén dedup nodig. event_id is desondanks uniek per order
 * voor het geval er later alsnog een browser-pixel wordt toegevoegd of als
 * dezelfde webhook twee keer vuurt (Shopify retry policy).
 */

const PIXEL_ID    = process.env.NEXT_PUBLIC_META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN
const API_VERSION  = 'v19.0'
// Optioneel: test_event_code uit Meta Events Manager → Test Events tab.
// Als gezet: events verschijnen in Test Events i.p.v. in je echte dataset.
// NIET in productie laten staan — dan telt niks mee voor optimalisatie.
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export type MetaPurchaseInput = {
  /** Unieke event ID — gebruikt voor deduplicatie. Meestal `order-<id>`. */
  eventId: string
  /** Unix timestamp (sec) wanneer de transactie plaatsvond. */
  eventTime: number
  /** URL waar de conversie plaatsvond (thank-you page indien bekend, anders onze domain). */
  eventSourceUrl: string
  /** Totale order value in major currency units (euro's, niet centen). */
  value: number
  currency: string
  /** Order ID voor Meta matching (advanced matching). */
  orderId: string
  contentIds: string[]
  numItems: number
  user: {
    email?: string        // raw, wordt hier gehashed
    phone?: string        // raw, wordt hier gehashed
    firstName?: string
    lastName?: string
    city?: string
    country?: string      // ISO 3166-1 alpha-2 (nl/de/gb/...)
    zip?: string
    /** `_fbp` cookie value (Facebook browser ID). */
    fbp?: string
    /** `_fbc` cookie value (Facebook click ID — set wanneer user via fbclid binnenkomt). */
    fbc?: string
    /** Client IP waar de user de bestelling plaatste. */
    clientIp?: string
    userAgent?: string
  }
}

export async function sendMetaPurchase(input: MetaPurchaseInput): Promise<{ ok: boolean; error?: string }> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return { ok: false, error: 'META_CAPI_TOKEN or NEXT_PUBLIC_META_PIXEL_ID not set' }
  }

  const { user } = input

  // Meta vereist dat alle PII SHA-256 gehashed wordt (behalve fbp/fbc en IP/UA).
  const user_data: Record<string, string | string[]> = {}
  if (user.email)     user_data.em = sha256(user.email)
  if (user.phone)     user_data.ph = sha256(user.phone.replace(/\D/g, ''))
  if (user.firstName) user_data.fn = sha256(user.firstName)
  if (user.lastName)  user_data.ln = sha256(user.lastName)
  if (user.city)      user_data.ct = sha256(user.city)
  if (user.country)   user_data.country = sha256(user.country)
  if (user.zip)       user_data.zp = sha256(user.zip.replace(/\s/g, ''))
  if (user.fbp)       user_data.fbp = user.fbp
  if (user.fbc)       user_data.fbc = user.fbc
  if (user.clientIp)  user_data.client_ip_address = user.clientIp
  if (user.userAgent) user_data.client_user_agent = user.userAgent

  const body: Record<string, unknown> = {
    data: [{
      event_name: 'Purchase',
      event_time: input.eventTime,
      event_id: input.eventId,
      event_source_url: input.eventSourceUrl,
      action_source: 'website',
      user_data,
      custom_data: {
        currency: input.currency,
        value: input.value,
        content_ids: input.contentIds,
        content_type: 'product',
        num_items: input.numItems,
        order_id: input.orderId,
      },
    }],
  }
  if (TEST_EVENT_CODE) {
    body.test_event_code = TEST_EVENT_CODE
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: `Meta CAPI ${res.status}: ${JSON.stringify(json)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
