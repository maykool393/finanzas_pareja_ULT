import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../lib/format'
import styles from './BudgetStory.module.css'
import type { BudgetBar, BudgetStoryData } from './summary'

/**
 * Color del relleno. "Gasto" (el total) va en índigo; cada categoría avisa en
 * tres pasos, como en la pantalla Presupuesto: bien, cerca del límite, pasada.
 */
function fillColor(bar: BudgetBar, isTotal: boolean) {
  if (isTotal) return 'var(--series-indigo)'
  if (bar.ratio > 1) return 'var(--loss-color)'
  if (bar.ratio >= 0.8) return 'var(--text-primary)'
  return 'var(--gain-color)'
}

interface BudgetStoryProps {
  data: BudgetStoryData | null
  currency: string
  monthName: string
}

/**
 * Historia 3 (DESIGN.md § Resumen): la barra "Gasto" y las dos categorías más
 * cerca de su límite. Cuando existan los presupuestos de Inversión y Deuda,
 * esas dos barras pasan a ser las suyas.
 */
export function BudgetStory({ data, currency, monthName }: BudgetStoryProps) {
  if (!data) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Sin presupuestos en {monthName}</p>
        <p className={styles.emptyText}>Ponle un límite a cada categoría de gasto y aquí vas a ver cómo va el mes.</p>
        <Link to="/presupuesto" className={styles.emptyAction}>
          Crear el primero
        </Link>
      </div>
    )
  }

  const bars = [data.total, ...data.top]

  return (
    <div className={styles.bars}>
      {bars.map((bar, i) => {
        const over = bar.spent > bar.amount
        const pct = Math.round(bar.ratio * 100)
        return (
          <div key={bar.key} className={styles.bar}>
            <div className={styles.top}>
              <span className={styles.name}>{bar.label}</span>
              <span className={over ? `${styles.pct} ${styles.over}` : styles.pct}>{pct} %</span>
            </div>
            <span className={styles.track} aria-hidden="true">
              <span
                className={styles.fill}
                style={
                  {
                    '--progress': Math.min(bar.ratio, 1),
                    '--fill': fillColor(bar, i === 0),
                    animationDelay: `${i * 120}ms`,
                  } as CSSProperties
                }
              />
            </span>
            <div className={styles.amounts}>
              <span>
                Gastado <b className="amount">{formatCurrency(bar.spent, currency)}</b>
              </span>
              {over ? (
                <span className={styles.over}>
                  Excedido <b className="amount">{formatCurrency(bar.spent - bar.amount, currency)}</b>
                </span>
              ) : (
                <span>
                  Disponible <b className="amount">{formatCurrency(bar.amount - bar.spent, currency)}</b>
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
