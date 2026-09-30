/**
 * Meses como 'YYYY-MM-01', el formato de `budgets.period_month` y
 * `settlements.period_month`. Sin zona horaria: se calcula en UTC, igual que
 * las fechas de los movimientos ('YYYY-MM-DD').
 */

/** El mes de hoy, ej. '2026-09-01'. */
export function currentPeriodMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/** Último día del mes de `monthStart` ('YYYY-MM-01'): para acotar el rango de movimientos. */
export function endOfMonth(monthStart: string): string {
  const date = new Date(`${monthStart}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + 1)
  date.setUTCDate(0)
  return date.toISOString().slice(0, 10)
}

/** El mes `delta` meses antes (negativo) o después (positivo) de `monthStart`. */
export function shiftMonth(monthStart: string, delta: number): string {
  const date = new Date(`${monthStart}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + delta)
  return date.toISOString().slice(0, 10)
}

/** "septiembre 2026" (sin "de": el navegador del Resumen lo muestra en mayúsculas). */
export function monthLabel(monthStart: string): string {
  const date = new Date(`${monthStart}T00:00:00Z`)
  const month = new Intl.DateTimeFormat('es-CL', { month: 'long', timeZone: 'UTC' }).format(date)
  return `${month} ${date.getUTCFullYear()}`
}

/** Solo el nombre del mes: "septiembre". */
export function monthName(monthStart: string): string {
  return new Intl.DateTimeFormat('es-CL', { month: 'long', timeZone: 'UTC' }).format(new Date(`${monthStart}T00:00:00Z`))
}
