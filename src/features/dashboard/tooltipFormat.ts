import { formatDate } from '../../lib/format'

export function formatTooltipDate(value: unknown): string {
  return typeof value === 'string' ? formatDate(value) : ''
}

/**
 * Estilos compartidos por los tres gráficos, con tokens: recharts los recibe
 * como props, no como CSS, así que se escriben con var(). --text-xs (12px)
 * va como número porque recharts lo pasa a un atributo SVG.
 */
export const CHART_TOOLTIP_STYLE = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-control)',
}

export const CHART_AXIS_TICK = { fill: 'var(--text-muted)', fontSize: 12 }
