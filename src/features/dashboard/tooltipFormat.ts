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

/**
 * Texto del tooltip siempre en --text-primary. Recharts lo pinta por defecto
 * con el color de la serie, pensado para relleno y no para texto: en "Gastos
 * por categoría" eran los fondos pastel sobre la tarjeta (1,1:1, invisible) y
 * en los otros dos, 3,3–4,4:1. La serie ya se nombra en el texto ("Ingresos",
 * "Supermercado"), así que el color no hace falta para identificarla.
 */
export const CHART_TOOLTIP_ITEM_STYLE = { color: 'var(--text-primary)' }
export const CHART_TOOLTIP_LABEL_STYLE = { color: 'var(--text-secondary)' }

export const CHART_AXIS_TICK = { fill: 'var(--text-muted)', fontSize: 12 }
