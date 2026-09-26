import { useContext } from 'react'
import { CurrencyContext } from '../lib/currencyContext'

/** Moneda del household actual, provista por <CurrencyProvider> (ver App.tsx). */
export function useCurrency(): string {
  return useContext(CurrencyContext)
}
