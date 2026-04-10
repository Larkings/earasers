import React, { createContext, useContext, useState, useEffect } from 'react'

export type Currency = 'EUR' | 'GBP'

// Vaste wisselkoers — pas periodiek aan
export const EUR_TO_GBP = 0.855

const CURRENCY_KEY = 'earasers-currency'

type CurrencyCtx = {
  currency: Currency
  setCurrency: (c: Currency) => void
  fmt: (eurPrice: number) => string
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: 'EUR',
  setCurrency: () => {},
  fmt: (p) => `€${p.toFixed(2).replace('.', ',')}`,
})

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>('EUR')

  useEffect(() => {
    // 1. Expliciete keuze van de gebruiker heeft prioriteit
    try {
      const saved = localStorage.getItem(CURRENCY_KEY)
      if (saved === 'EUR' || saved === 'GBP') {
        setCurrencyState(saved)
        return
      }
    } catch {}

    // 2. IP-gebaseerde detectie als geen opgeslagen voorkeur
    fetch('/api/geo')
      .then(r => r.json())
      .then(({ country }: { country: string }) => {
        if (country === 'GB') setCurrencyState('GBP')
      })
      .catch(() => {}) // stille fallback naar EUR
  }, [])

  const setCurrency = (c: Currency) => {
    setCurrencyState(c)
    try { localStorage.setItem(CURRENCY_KEY, c) } catch {}
  }

  const fmt = (eurPrice: number): string => {
    if (currency === 'GBP') {
      return `£${(eurPrice * EUR_TO_GBP).toFixed(2)}`
    }
    return `€${eurPrice.toFixed(2).replace('.', ',')}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
