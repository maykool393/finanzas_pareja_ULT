import type { CSSProperties } from 'react'
import styles from './PercentPill.module.css'

interface PercentPillProps {
  /** Ya formateado: "48 %". */
  value: string
  /** Color de la serie: tiñe el fondo al 16%. Sin él, fondo --surface-sunken. */
  tint?: string
}

/**
 * Píldora de porcentaje (DESIGN.md § Píldora de porcentaje). El texto es
 * siempre el de la superficie, nunca el color de la serie: en color no
 * llegaba a 4.5:1 sobre fondos pastel.
 */
export function PercentPill({ value, tint }: PercentPillProps) {
  return (
    <span className={`amount ${styles.pill}`} style={tint ? ({ '--pill-tint': tint } as CSSProperties) : undefined}>
      {value}
    </span>
  )
}
