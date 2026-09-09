import type { ReactNode } from 'react'
import { ProgressBar } from './ProgressBar'
import styles from './ItemCard.module.css'

export type ItemVariant = 'account-a' | 'account-b' | 'debt-a' | 'debt-b' | 'investment-a' | 'investment-b'

interface ItemCardProps {
  name: string
  amount: string
  variant: ItemVariant
  icon: ReactNode
  /** Iniciales del dueño; null/undefined = cuenta compartida. */
  owner?: string | null
  /** Solo para deudas: proporción de pagos completados (0–1). */
  progress?: number
  onClick?: () => void
}

function SharedIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7.5" r="2.3" />
      <circle cx="14" cy="7.5" r="2.3" />
      <path d="M2.5 16c.6-2.4 2.3-3.7 4.5-3.7s3.9 1.3 4.5 3.7M9 16c.6-2.4 2.3-3.7 4.5-3.7s3.9 1.3 4.5 3.7" />
    </svg>
  )
}

export function ItemCard({ name, amount, variant, icon, owner, progress, onClick }: ItemCardProps) {
  return (
    <article
      className={onClick ? `${styles.card} ${styles[variant]} ${styles.clickable}` : `${styles.card} ${styles[variant]}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.name}>{name}</span>
      </div>

      <p className={`amount ${styles.amount}`}>{amount}</p>

      {progress !== undefined && (
        <ProgressBar ratio={progress} trackColor="rgba(255,255,255,0.5)" fillColor="var(--fill)" />
      )}

      <span className={styles.avatar} aria-label={owner ? `Cuenta de ${owner}` : 'Cuenta compartida'}>
        {owner ? owner.slice(0, 2).toUpperCase() : <SharedIcon />}
      </span>
    </article>
  )
}
