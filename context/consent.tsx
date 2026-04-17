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

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState | null>(null)

  useEffect(() => {
    try {
      const parsed = parseStored(localStorage.getItem(STORAGE_KEY))
      if (parsed) startTransition(() => setConsentState(parsed))
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      startTransition(() => setConsentState(parseStored(e.newValue)))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setConsent = (next: ConsentState) => {
    try { localStorage.setItem(STORAGE_KEY, serialize(next)) } catch {}
    setConsentState(next)

    // Shopify Customer Privacy API — officiële manier om consent door te
    // geven aan Shopify's pixel/analytics systeem. Zonder dit weet Shopify
    // niet dat een user consent heeft gegeven en worden Customer Events
    // (App-pixels voor Meta, Google, GoAffPro) niet correct gefired.
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
      w.Shopify?.customerPrivacy?.setTrackingConsent({
        analytics: next.analytics,
        marketing: next.marketing,
        preferences: next.analytics,
        sale_of_data: next.marketing,
      }, () => {})
    } catch {}
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
