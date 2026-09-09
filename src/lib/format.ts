const LOCALE = 'es-CL'
const CURRENCY = 'CLP'

/** Monto con símbolo de moneda. Los montos se guardan en la unidad menor (enteros). */
export function formatCurrency(
  amount: number,
  { compact = false }: { compact?: boolean } = {},
): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 0,
  }).format(amount)
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
