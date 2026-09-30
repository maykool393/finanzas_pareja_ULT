import { type CSSProperties, useRef } from 'react'
import { formatCurrency } from '../../lib/format'
import styles from './IncomeStory.module.css'
import frame from './Stories.module.css'
import type { MonthTotals } from './summary'
import { useCountUp } from './useCountUp'

/** Geometría del anillo en el viewBox de 200: radio 80, trazo 14. */
const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/**
 * Espacio entre los dos arcos, medido en el trazo: los extremos redondeados
 * ocupan 7 cada uno, así que quedan 6 visibles.
 */
const GAP = 14 + 6

interface Arc {
  length: number
  /** Dónde empieza, en grados desde arriba. */
  start: number
  className: string
}

function arcs(income: number, expense: number): Arc[] {
  const total = income + expense
  if (total === 0) return []
  if (income === 0 || expense === 0) {
    return [{ length: CIRCUMFERENCE, start: 0, className: income > 0 ? styles.incomeArc : styles.expenseArc }]
  }
  const incomeLength = (income / total) * CIRCUMFERENCE
  // Un arco muy corto queda en un punto: el extremo redondeado.
  const visible = (length: number) => Math.max(length - GAP, 0.01)
  const startOffset = ((GAP / 2) / CIRCUMFERENCE) * 360
  return [
    { length: visible(incomeLength), start: startOffset, className: styles.incomeArc },
    { length: visible(CIRCUMFERENCE - incomeLength), start: (incomeLength / CIRCUMFERENCE) * 360 + startOffset, className: styles.expenseArc },
  ]
}

function movementsLabel(count: number) {
  return count === 1 ? '1 movimiento' : `${count} movimientos`
}

interface IncomeStoryProps {
  totals: MonthTotals
  currency: string
  /** "septiembre": para el resumen en texto del anillo. */
  monthName: string
}

/**
 * Historia 1: el anillo compara lo que entró con lo que salió; al centro, el
 * balance, que cuenta hasta su valor mientras el anillo se dibuja.
 */
export function IncomeStory({ totals, currency, monthName }: IncomeStoryProps) {
  const { income, expense } = totals
  const balance = income - expense
  const balanceText = formatCurrency(balance, currency, { signed: true })
  const balanceRef = useRef<HTMLSpanElement>(null)
  useCountUp(balanceRef, balance, (value) => formatCurrency(value, currency, { signed: true }))

  const drawn = arcs(income, expense)
  const total = income + expense
  const ringLabel =
    total === 0
      ? `Sin ingresos ni gastos en ${monthName}.`
      : `De lo que se movió en ${monthName}, ${Math.round((income / total) * 100)} % fueron ingresos y ${
          100 - Math.round((income / total) * 100)
        } % gastos.`

  // Un monto largo (pesos chilenos) no cabe en el anillo a 32px.
  const sizeClass = balanceText.length > 10 ? styles.balanceSmall : balanceText.length > 8 ? styles.balanceMedium : ''
  const toneClass = balance > 0 ? styles.gain : balance < 0 ? styles.loss : ''

  return (
    <>
      <div className={styles.center}>
        <div className={`${styles.ring} ${frame.pop}`}>
          <svg width="210" height="210" viewBox="0 0 200 200" role="img" aria-label={ringLabel}>
            {drawn.length === 0 && <circle cx="100" cy="100" r={RADIUS} className={styles.track} />}
            {drawn.map((arc) => (
              <circle
                key={arc.className}
                cx="100"
                cy="100"
                r={RADIUS}
                className={`${styles.arc} ${arc.className}`}
                // Sin repetir el patrón: un hueco más largo que la vuelta.
                strokeDasharray={`${arc.length} 1000`}
                transform={`rotate(${arc.start - 90} 100 100)`}
                style={{ '--length': arc.length } as CSSProperties}
              />
            ))}
          </svg>
          <div className={styles.ringCenter}>
            <span className={styles.balanceLabel}>Balance</span>
            <span ref={balanceRef} className={`amount ${styles.balance} ${sizeClass} ${toneClass}`} aria-hidden="true" />
            <span className="visually-hidden">Balance: {balanceText}</span>
          </div>
        </div>
      </div>

      <div className={styles.cards}>
        <div className={styles.glass}>
          <span className={styles.cardLabel}>
            <span className={`${styles.dot} ${styles.incomeDot}`} aria-hidden="true" />
            Ingresos
          </span>
          <span className={`amount ${styles.cardAmount}`}>{formatCurrency(income, currency)}</span>
          <span className={`${styles.cardMeta} ${styles.gain}`}>{movementsLabel(totals.incomeCount)}</span>
        </div>
        <div className={styles.glass}>
          <span className={styles.cardLabel}>
            <span className={`${styles.dot} ${styles.expenseDot}`} aria-hidden="true" />
            Gastos
          </span>
          <span className={`amount ${styles.cardAmount}`}>{formatCurrency(expense, currency)}</span>
          <span className={`${styles.cardMeta} ${styles.loss}`}>{movementsLabel(totals.expenseCount)}</span>
        </div>
      </div>
    </>
  )
}
