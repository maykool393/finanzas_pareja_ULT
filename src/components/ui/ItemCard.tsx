import type { ReactNode } from 'react'
import { PeopleIcon } from './icons'
import { ProgressBar } from './ProgressBar'
import styles from './ItemCard.module.css'

export type ItemVariant = 'account-a' | 'account-b' | 'debt-a' | 'debt-b' | 'investment-a' | 'investment-b'

interface ItemCardProps {
  name: string
  amount: string
  variant: ItemVariant
  icon: ReactNode
  /** Nombre del dueño; null/undefined = compartida. */
  owner?: string | null
  /** Solo para deudas: proporción de pagos completados (0–1). */
  progress?: number
  onClick: () => void
}

/**
 * Tarjeta de cuenta, deuda o inversión. Es un <button> real (abre la edición).
 * El nombre accesible se arma a mano: el de su contenido juntaría los textos
 * sin separar ("Banesco$1.234MA") y perdería al dueño, que solo se ve como
 * iniciales o un ícono. "Compartida" concuerda con los tres: cuenta, deuda e
 * inversión.
 */
export function ItemCard({ name, amount, variant, icon, owner, progress, onClick }: ItemCardProps) {
  const label = [
    name,
    amount,
    progress !== undefined ? `${Math.round(Math.min(1, Math.max(0, progress)) * 100)} % pagado` : null,
    owner ? `de ${owner}` : 'compartida',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <button type="button" className={`${styles.card} ${styles[variant]}`} onClick={onClick} aria-label={label}>
      <span className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.name}>{name}</span>
      </span>

      <span className={`amount ${styles.amount}`}>{amount}</span>

      {progress !== undefined && (
        <span className={styles.progress}>
          <ProgressBar ratio={progress} trackColor="var(--surface-on-category)" fillColor="var(--fill)" />
        </span>
      )}

      <span className={styles.avatar}>{owner ? owner.slice(0, 2).toUpperCase() : <PeopleIcon />}</span>
    </button>
  )
}
