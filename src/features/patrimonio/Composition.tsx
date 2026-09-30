import type { CSSProperties, MouseEvent } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { PercentPill } from '../../components/ui/PercentPill'
import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency } from '../../lib/format'
import styles from './Composition.module.css'
import type { CompositionKey, CompositionPart } from './compositionParts'

/** Color de cada grupo: sobre la cabecera (versiones claras) y en la hoja (sobre --surface-card). */
const COLORS: Record<CompositionKey, { header: string; sheet: string }> = {
  cuentas: { header: 'var(--header-series-accounts)', sheet: 'var(--gain-color)' },
  inversiones: { header: 'var(--header-series-investments)', sheet: 'var(--series-indigo)' },
  deudas: { header: 'var(--header-series-debts)', sheet: 'var(--loss-color)' },
}

interface CompositionBarProps {
  parts: CompositionPart[]
  /** Abre la hoja; con un grupo si se tocó su segmento. */
  onOpen: (focus: CompositionKey | null) => void
}

/**
 * Barra de composición bajo el total de Patrimonio (DESIGN.md § Patrimonio).
 * Es un solo botón de 44px de alto, no tres: los segmentos miden 7px, muy
 * poco para tocarlos. Al tocar, se abre la hoja con el grupo del segmento
 * que quedó bajo el dedo; con teclado, se abre sin ninguno destacado.
 */
export function CompositionBar({ parts, onOpen }: CompositionBarProps) {
  const visible = parts.filter((part) => part.pct > 0)

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // detail 0: activado con teclado (Enter o Espacio), sin posición de puntero.
    if (event.detail === 0) return onOpen(null)
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    let edge = 0
    for (const part of visible) {
      edge += part.pct
      if (x <= edge) return onOpen(part.key)
    }
    onOpen(null)
  }

  const summary = parts.map((part) => `${part.label} ${part.pct} %`).join(', ')

  return (
    <button type="button" className={styles.barButton} onClick={handleClick} aria-label={`Ver composición del patrimonio: ${summary}`}>
      <span className={styles.bar}>
        {visible.map((part) => (
          <span
            key={part.key}
            className={styles.segment}
            style={{ flexGrow: part.pct, '--segment-color': COLORS[part.key].header } as CSSProperties}
          />
        ))}
      </span>
      {/* Pista: la barra se puede abrir. Baja y vuelve dos veces, y se queda quieta. */}
      <svg className={styles.hint} width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
        <path d="M1 1.5 7 6.5l6-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

interface CompositionSheetProps {
  open: boolean
  onClose: () => void
  parts: CompositionPart[]
  focus: CompositionKey | null
  onFocus: (focus: CompositionKey | null) => void
}

/**
 * Hoja "Composición del patrimonio": una fila por grupo. La destacada toma
 * fondo y escala; las demás no se atenúan (su texto bajaría de 4.5:1).
 */
export function CompositionSheet({ open, onClose, parts, focus, onFocus }: CompositionSheetProps) {
  const currency = useCurrency()

  return (
    <Dialog open={open} onClose={onClose} title="Composición del patrimonio">
      <ul className={styles.rows} role="list">
        {parts.map((part) => {
          const color = COLORS[part.key].sheet
          const focused = focus === part.key
          return (
            <li key={part.key}>
              <button
                type="button"
                className={focused ? `${styles.row} ${styles.focused}` : styles.row}
                style={{ '--series': color } as CSSProperties}
                aria-pressed={focused}
                onClick={() => onFocus(focused ? null : part.key)}
              >
                <span className={styles.rowTop}>
                  <span className={styles.label}>{part.label}</span>
                  <PercentPill value={`${part.pct} %`} tint={color} />
                </span>
                <span className={`amount ${styles.amount}`}>{formatCurrency(part.amount, currency)}</span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.fill} style={{ transform: `translateX(${part.pct - 100}%)` }} />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Dialog>
  )
}
