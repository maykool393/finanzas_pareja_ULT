const LOCALE = 'es-CL'

/**
 * Símbolo de cada moneda que se puede elegir en el onboarding. Explícito porque
 * Intl no es confiable acá: con es-CL muestra código para monedas no locales
 * ("EUR 1.234", "US$") y ni siquiera con narrowSymbol trae "S/" para PEN.
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  CLP: '$',
  USD: '$',
  EUR: '€',
  MXN: '$',
  COP: '$',
  ARS: '$',
  PEN: 'S/',
}

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_SYMBOLS)

/** Solo el símbolo de la moneda (ej. "€", "S/", "$") — para prefijos de input y etiquetas. */
export function getCurrencySymbol(currency: string): string {
  const known = CURRENCY_SYMBOLS[currency]
  if (known) return known
  const part = new Intl.NumberFormat(LOCALE, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
    .formatToParts(0)
    .find((p) => p.type === 'currency')
  return part?.value ?? currency
}

/**
 * Monto con símbolo de moneda. Los montos se guardan en la unidad menor (enteros).
 * `currency` es la del household actual — obtenerla con useCurrency(), nunca fija a mano.
 */
export function formatCurrency(
  amount: number,
  currency: string,
  { compact = false }: { compact?: boolean } = {},
): string {
  const symbol = getCurrencySymbol(currency)
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 0,
  })
    .formatToParts(amount)
    .map((part) => (part.type === 'currency' ? symbol : part.value))
    .join('')
}

/** Monto sin símbolo, para tablas donde la moneda ya está en la cabecera. */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(amount)
}

export function formatPercent(ratio: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(ratio)
}

export function formatDate(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(value)
}

export function formatMonth(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' }).format(value)
}
