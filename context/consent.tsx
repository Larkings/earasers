import React, { createContext, useContext, useEffect, useState, startTransition, ReactNode } from 'react'

/**
 * Cookie consent state. We slaan op in localStorage onder ÉÉN key zodat de
 * waarde meteen leesbaar is door de cookie-banner én door analytics utils
 * (pixels) zonder een race condition.
 *
 * We onderscheiden NIET tussen analytics en marketing — dat zou de UX van
 * de banner complex maken. 'all' = alle pixels aan, 'necessary' = niets.
 * Toekomstig: granulaire opt-in als juridisch nodig.
 */

export type ConsentLevel = 'all' | 'necessary' | null

const STORAGE_KEY = 'earasers-cookie-consent'

type ConsentContextValue = {
  consent: ConsentLevel
  setConsent: (level: 'all' | 'necessary') => void
  marketingAllowed: boolean
  analyticsAllowed: boolean
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentLevel>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'all' || stored === 'necessary') {
        // startTransition voorkomt cascading renders bij SSR-hydration
        startTransition(() => setConsentState(stored))
      }
    } catch { /* localStorage geblokkeerd, blijft null */ }

    // Sync over tabs: als user in een andere tab consent wijzigt
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const v = e.newValue
      startTransition(() => setConsentState(v === 'all' || v === 'necessary' ? v : null))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setConsent = (level: 'all' | 'necessary') => {
    try { localStorage.setItem(STORAGE_KEY, level) } catch {}
    setConsentState(level)
  }

  return (
    <ConsentContext.Provider value={{
      consent,
      setConsent,
      marketingAllowed: consent === 'all',
      analyticsAllowed: consent === 'all',
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

/**
 * Sync helper voor non-React code (lib/analytics.ts) die niet in een hook
 * draait. Leest direct uit localStorage.
 */
export function readConsent(): ConsentLevel {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'all' || stored === 'necessary') return stored
  } catch {}
  return null
}
