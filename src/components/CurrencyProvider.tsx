import type { ReactNode } from 'react'
import { useHousehold } from '../hooks/useHousehold'
import { CurrencyContext, DEFAULT_CURRENCY } from '../lib/currencyContext'

/** Expone la moneda del household actual a formatCurrency() (vía useCurrency()) en todo el árbol protegido. */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { household } = useHousehold()

  return (
    <CurrencyContext.Provider value={household?.currency ?? DEFAULT_CURRENCY}>{children}</CurrencyContext.Provider>
  )
}
