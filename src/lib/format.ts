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

/**
 * Decimales con que se escribe y se muestra cada moneda. Los montos se guardan
 * en unidades de la moneda con hasta 2 decimales (`numeric(14, 2)`), no en la
 * unidad menor. CLP no tiene centavos; COP los tiene en teoría, pero no se usan.
 */
const CURRENCY_DECIMALS: Record<string, number> = {
  CLP: 0,
  COP: 0,
  USD: 2,
  EUR: 2,
  MXN: 2,
  ARS: 2,
  PEN: 2,
}

export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency] ?? 2
}

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
 * Monto con símbolo de moneda, con los decimales de la moneda (`€12,50`, `$1.234`).
 * `currency` es la del household actual — obtenerla con useCurrency(), nunca fija a mano.
 *
 * El signo va siempre antes del símbolo: "-$23.990", "+$850.000". Intl con
 * es-CL lo pone después ("$-23.990"), y junto al "+" de los ingresos los dos
 * montos no se leían parejos. `signed` agrega el "+" a los positivos (listas de
 * movimientos, donde importa distinguir ingreso de gasto); el cero no lleva signo.
 */
export function formatCurrency(
  amount: number,
  currency: string,
  { compact = false, signed = false }: { compact?: boolean; signed?: boolean } = {},
): string {
  const symbol = getCurrencySymbol(currency)
  // Compacto ("$3 M") siempre sin decimales: es para ejes y resúmenes.
  const decimals = compact ? 0 : getCurrencyDecimals(currency)
  const magnitude = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .formatToParts(Math.abs(amount))
    .map((part) => (part.type === 'currency' ? symbol : part.value))
    .join('')

  // Redondeado igual que el texto: en CLP un -0,4 se muestra "$0", no "-$0".
  const factor = 10 ** decimals
  const rounded = Math.round(amount * factor) / factor
  if (rounded < 0) return `-${magnitude}`
  if (signed && rounded > 0) return `+${magnitude}`
  return magnitude
}

/** Monto sin símbolo (ej. el valor de un campo, que ya muestra el símbolo al lado). */
export function formatAmount(amount: number, decimals = 0): string {
  return new Intl.NumberFormat(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
    amount,
  )
}

/**
 * Interpreta un monto escrito a mano, en formato es-CL: la coma es decimal y
 * el punto separa miles ("1.234,50"). Como en muchos teclados el decimal es un
 * punto, un único punto seguido de 1 o 2 dígitos al final también se toma como
 * decimal ("12.5"); "1.234" sigue siendo mil doscientos treinta y cuatro. Los
 * decimales que sobran para la moneda se descartan. null = campo vacío.
 */
export function parseAmount(raw: string, decimals: number): number | null {
  const negative = raw.trim().startsWith('-')
  const cleaned = raw.replace(/[^\d.,]/g, '')

  let intPart = cleaned
  let fracPart = ''
  const comma = cleaned.lastIndexOf(',')
  if (comma !== -1) {
    intPart = cleaned.slice(0, comma)
    fracPart = cleaned.slice(comma + 1)
  } else {
    const dots = cleaned.split('.')
    if (dots.length === 2 && /^\d{1,2}$/.test(dots[1]) && decimals > 0) {
      intPart = dots[0]
      fracPart = dots[1]
    }
  }

  const intDigits = intPart.replace(/\D/g, '')
  const fracDigits = fracPart.replace(/\D/g, '').slice(0, decimals)
  if (intDigits === '' && fracDigits === '') return null

  const value = Number(`${intDigits || '0'}.${fracDigits || '0'}`)
  return negative ? -value : value
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
