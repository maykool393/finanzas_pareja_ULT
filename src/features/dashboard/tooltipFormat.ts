import { formatCurrency, formatDate } from '../../lib/format'

/** Recharts tipa los valores de tooltip como unknown/ValueType — se normalizan acá. */
export function formatTooltipCurrency(value: unknown): string {
  return formatCurrency(Number(value))
}

export function formatTooltipDate(value: unknown): string {
  return typeof value === 'string' ? formatDate(value) : ''
}
