import type { NextApiRequest, NextApiResponse } from 'next'
import { rateLimit } from '../../lib/rate-limit'
import { checkOrigin } from '../../lib/csrf'

/**
 * Contactformulier → Shopify's native /contact endpoint.
 *
 * Shopify online stores accepteren form-encoded POSTs op /contact. Shopify
 * stuurt dan een email naar het configured "Sender email" adres van de shop
 * (Settings → Notifications → Sender email). Geen extra mail-provider nodig.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!checkOrigin(req, res)) return

  // Max 3 form submissions per IP per 10 min — mitigeert spam
  if (!rateLimit(req, res, { limit: 3, windowMs: 10 * 60_000, name: 'contact' })) return

  if (!SHOP_DOMAIN) {
    console.error('[api/contact] SHOPIFY_STORE_DOMAIN niet geconfigureerd')
    return res.status(500).json({ error: 'Contact endpoint not configured' })
  }

  const body = req.body as {
    name?: unknown
    email?: unknown
    subject?: unknown
    message?: unknown
    // Honeypot — echte gebruikers laten dit veld leeg, bots vullen het vaak in
    company?: unknown
  }

  const name    = typeof body?.name    === 'string' ? body.name.trim()    : ''
  const email   = typeof body?.email   === 'string' ? body.email.trim()   : ''
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  const honeypot = typeof body?.company === 'string' ? body.company : ''

  // Honeypot triggered → doe alsof het gelukt is (bots krijgen geen feedback)
  if (honeypot) return res.status(200).json({ ok: true })

  if (!name || name.length > 100) return res.status(400).json({ error: 'Naam is vereist (max 100 tekens)' })
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Geldig email-adres is vereist' })
  }
  if (!message || message.length > 5000) {
    return res.status(400).json({ error: 'Bericht is vereist (max 5000 tekens)' })
  }
  if (subject.length > 200) return res.status(400).json({ error: 'Onderwerp te lang' })

  try {
    const formData = new URLSearchParams()
    formData.append('form_type', 'contact')
    formData.append('utf8', '✓')
    formData.append('contact[name]', name)
    formData.append('contact[email]', email)
    if (subject) formData.append('contact[subject]', subject)
    formData.append('contact[body]', message)

    const shopifyRes = await fetch(`https://${SHOP_DOMAIN}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html',
        // Shopify verwerkt het formulier maar redirect naar /contact?posted=true
        // We volgen die redirect niet — alleen status code telt.
      },
      body: formData.toString(),
      redirect: 'manual',
    })

    // Shopify antwoord 200 of 302 bij succes (redirect naar /contact?posted=true)
    // 422 bij validatiefout
    if (shopifyRes.status >= 200 && shopifyRes.status < 400) {
      return res.status(200).json({ ok: true })
    }

    console.error('[api/contact] Shopify contact endpoint returned:', shopifyRes.status)
    return res.status(502).json({ error: 'Bericht kon niet worden verzonden. Probeer het opnieuw.' })
  } catch (err) {
    console.error('[api/contact] Fetch failed:', err)
    return res.status(502).json({ error: 'Bericht kon niet worden verzonden. Probeer het opnieuw.' })
  }
}
