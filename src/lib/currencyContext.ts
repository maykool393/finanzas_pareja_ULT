import { createContext } from 'react'

/** Fallback antes de que useHousehold() resuelva, o si el household no tiene moneda configurada. */
export const DEFAULT_CURRENCY = 'CLP'

export const CurrencyContext = createContext<string>(DEFAULT_CURRENCY)
