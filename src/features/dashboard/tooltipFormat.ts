import { formatDate } from '../../lib/format'

export function formatTooltipDate(value: unknown): string {
  return typeof value === 'string' ? formatDate(value) : ''
}
