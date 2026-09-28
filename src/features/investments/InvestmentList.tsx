import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency, formatDate, formatPercent } from '../../lib/format'
import type { Investment } from '../../types/domain'
import styles from './InvestmentList.module.css'

/** Variación desde lo invertido, con signo: "+10 %", "-5 %", o null sin monto invertido. */
function variation(investment: Investment) {
  if (investment.invested <= 0) return null
  const ratio = (investment.currentValue - investment.invested) / investment.invested
  if (ratio === 0) return { text: formatPercent(0), tone: null }
  return {
    text: `${ratio > 0 ? '+' : '-'}${formatPercent(Math.abs(ratio))}`,
    tone: ratio > 0 ? styles.gain : styles.loss,
  }
}

interface InvestmentListProps {
  items: Investment[]
  onSelect: (investment: Investment) => void
}

/**
 * Inversiones en lista, no en tarjetas (DESIGN.md § Lista de inversiones).
 * Cada fila es un botón que abre la edición. Los grupos (encabezado con su
 * cuadro de ícono y botón +) llegan cuando el modelo los tenga (README, R6).
 */
export function InvestmentList({ items, onSelect }: InvestmentListProps) {
  const currency = useCurrency()

  return (
    <ul className={styles.list} role="list">
      {items.map((investment) => {
        const change = variation(investment)
        const value = formatCurrency(investment.currentValue, currency)
        const label = [investment.name, value, change?.text, `desde el ${formatDate(investment.investedAt)}`]
          .filter(Boolean)
          .join(', ')

        return (
          <li key={investment.id}>
            <button type="button" className={styles.row} onClick={() => onSelect(investment)} aria-label={label}>
              <span className={styles.start}>
                <span className={styles.name}>{investment.name}</span>
                <span className={styles.meta}>{formatDate(investment.investedAt)}</span>
              </span>
              <span className={styles.end}>
                <span className={`amount ${styles.value}`}>{value}</span>
                {change && <span className={`amount ${styles.change} ${change.tone ?? ''}`}>{change.text}</span>}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
