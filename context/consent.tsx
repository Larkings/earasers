import React, { createContext, useContext, useEffect, useState, startTransition, ReactNode } from 'react'

/**
 * Granulaire cookie consent. Twee categorieën die los aan/uit kunnen:
 *   - analytics (bv. GA4) — anonieme site-statistieken
 *   - marketing (bv. Meta Pixel, Google Ads, GoAffPro affiliate)
 *
 * Storage formaat: JSON `{a:0|1, m:0|1}` onder STORAGE_KEY.
 * Backwards compat met legacy 'all'/'necessary' string waarden zodat
 * bestaande users niet opnieuw consent hoeven te geven.
 */

export type ConsentState = {
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'earasers-cookie-consent'

const NULL_STATE = { analytics: false, marketing: false }

type ConsentContextValue = {
  /** Null = nog geen keuze gemaakt (banner moet verschijnen) */
  consent: ConsentState | null
  setConsent: (next: ConsentState) => void
  acceptAll: () => void
  rejectAll: () => void
  analyticsAllowed: boolean
  marketingAllowed: boolean
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

function parseStored(raw: string | null): ConsentState | null {
  if (!raw) return null
  // Legacy formaat
  if (raw === 'all')       return { analytics: true,  marketing: true  }
  if (raw === 'necessary') return { analytics: false, marketing: false }
  // JSON formaat
  try {
    const obj = JSON.parse(raw)
    if (obj && typeof obj === 'object' && typeof obj.a === 'number' && typeof obj.m === 'number') {
      return { analytics: obj.a === 1, marketing: obj.m === 1 }
    }
  } catch {}
  return null
}

function serialize(state: ConsentState): string {
  return JSON.stringify({ a: state.analytics ? 1 : 0, m: state.marketing ? 1 : 0 })
}

/**
 * Sync consent state naar Shopify Customer Privacy API.
 *
 * Kritiek voor headless: Shopify's App-pixels (Meta, Google, GoAffPro)
 * en sessie-attributie vertrouwen op `setTrackingConsent` om consent-state
 * te kennen. Zonder deze call vóór de eerste pageview → Shopify negeert
 * de sessie → 0% conversie in dashboard.
 *
 * Wordt aangeroepen bij:
 * 1. Initiële load (als consent al in localStorage staat)
 * 2. User klikt accept/reject in de cookie banner
 *
 * Retourneert een Promise die resolved wanneer Shopify de consent heeft
 * geaccepteerd (callback), zodat trackPageView hierop kan wachten.
 */
let consentSynced = false
function syncShopifyConsent(state: ConsentState): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const w = window as unknown as {
        Shopify?: {
          customerPrivacy?: {
            setTrackingConsent: (
              consent: Record<string, boolean>,
              callback: () => void,
            ) => void
          }
        }
      }
      if (w.Shopify?.customerPrivacy?.setTrackingConsent) {
        w.Shopify.customerPrivacy.setTrackingConsent({
          analytics: state.analytics,
          marketing: state.marketing,
          preferences: state.analytics,
          sale_of_data: state.marketing,
        }, () => { consentSynced = true; resolve() })
        // Timeout fallback: als Shopify Customer Privacy API niet
        // laadt (headless → geen Shopify JS), niet oneindig blocken.
        setTimeout(() => { consentSynced = true; resolve() }, 500)
      } else {
        // Shopify.customerPrivacy niet beschikbaar (headless) — ga door
        consentSynced = true
        resolve()
      }
    } catch {
      consentSynced = true
      resolve()
    }
  })
}

/** Wacht tot consent minstens één keer naar Shopify is gesynchroniseerd. */
export function waitForConsentSync(): Promise<void> {
  if (consentSynced) return Promise.resolve()
  // Poll kort — sync wordt getriggerd door ConsentProvider mount
  return new Promise((resolve) => {
    const check = () => { if (consentSynced) resolve(); else setTimeout(check, 50) }
    check()
    // Hard cap: na 2s ga door, blokkeer trackPageView niet oneindig
    setTimeout(() => { consentSynced = true; resolve() }, 2000)
  })
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState | null>(null)

  useEffect(() => {
    try {
      const parsed = parseStored(localStorage.getItem(STORAGE_KEY))
      if (parsed) {
        startTransition(() => setConsentState(parsed))
        // Sync consent naar Shopify VÓÓR eerste trackPageView.
        // Dit fixeert de race condition: zonder dit weet Shopify
        // niet dat de user consent heeft → sessie wordt genegeerd.
        void syncShopifyConsent(parsed)
      } else {
        // Geen consent opgeslagen → sync NULL_STATE zodat Shopify
        // in ieder geval weet dat er nog geen consent is.
        void syncShopifyConsent(NULL_STATE)
      }
    } catch {
      void syncShopifyConsent(NULL_STATE)
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const parsed = parseStored(e.newValue)
      startTransition(() => setConsentState(parsed))
      if (parsed) void syncShopifyConsent(parsed)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setConsent = (next: ConsentState) => {
    try { localStorage.setItem(STORAGE_KEY, serialize(next)) } catch {}
    setConsentState(next)
    void syncShopifyConsent(next)
  }

  const acceptAll = () => setConsent({ analytics: true,  marketing: true  })
  const rejectAll = () => setConsent({ analytics: false, marketing: false })

  const effective = consent ?? NULL_STATE

  return (
    <ConsentContext.Provider value={{
      consent,
      setConsent,
      acceptAll,
      rejectAll,
      analyticsAllowed: effective.analytics,
      marketingAllowed: effective.marketing,
    }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider')
  return ctx
}

/** Sync helper voor non-React code (lib/analytics.ts). */
export function readConsent(): ConsentState {
  if (typeof window === 'undefined') return NULL_STATE
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY)) ?? NULL_STATE
  } catch {
    return NULL_STATE
  }
}
