import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons'
import { monthLabel, shiftMonth } from '../../lib/month'
import styles from './MonthNavigator.module.css'

interface MonthNavigatorProps {
  month: string
  onChange: (month: string) => void
  /** El último mes que se puede ver: el actual. Después no hay datos. */
  latest: string
}

/**
 * "SEPTIEMBRE 2026" entre dos flechas, en la cabecera del Resumen (DESIGN.md §
 * Estructura de la app). Las historias muestran el mes elegido.
 */
export function MonthNavigator({ month, onChange, latest }: MonthNavigatorProps) {
  const atLatest = month >= latest

  return (
    <div className={styles.nav}>
      <button type="button" className={styles.arrow} aria-label="Mes anterior" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeftIcon aria-hidden="true" />
      </button>
      {/* Se anuncia al cambiar: con las flechas, el foco se queda en el botón. */}
      <p className={styles.label} aria-live="polite">
        {monthLabel(month)}
      </p>
      <button
        type="button"
        className={styles.arrow}
        aria-label="Mes siguiente"
        // aria-disabled y no disabled: al llegar al mes actual con esta flecha,
        // disabled le quitaría el foco (se iría al <body>).
        aria-disabled={atLatest}
        onClick={() => {
          if (!atLatest) onChange(shiftMonth(month, 1))
        }}
      >
        <ChevronRightIcon aria-hidden="true" />
      </button>
    </div>
  )
}
