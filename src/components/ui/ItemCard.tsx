import type { ReactNode } from 'react'
import { StarFilledIcon } from './icons'
import { ProgressBar } from './ProgressBar'
import styles from './ItemCard.module.css'

export type ItemVariant = 'account-a' | 'account-b' | 'debt-a' | 'debt-b' | 'investment-a' | 'investment-b'

interface ItemCardProps {
  name: string
  amount: string
  variant: ItemVariant
  icon: ReactNode
  /** Nombre del dueño; null/undefined = compartida. Solo para el texto accesible. */
  owner?: string | null
  /** Avatares del dueño (o de los dos, si es compartida), arriba a la derecha. */
  avatars?: ReactNode
  /** Cuenta principal: estrella después del nombre. */
  primary?: boolean
  /** Solo para deudas: proporción pagada (0–1). */
  progress?: number
  /** Solo para deudas: "cuota · N pagos", bajo la barra. */
  caption?: string | null
  onClick: () => void
}

/**
 * Tarjeta de cuenta o deuda (DESIGN.md § Tarjeta de cuenta y de deuda). Es un
 * <button> real (abre la edición). El nombre accesible se arma a mano: el de su
 * contenido juntaría los textos sin separar ("Banesco$1.234MF") y perdería al
 * dueño, que solo se ve como iniciales. "Compartida" concuerda con los tres:
 * cuenta, deuda e inversión.
 */
export function ItemCard({ name, amount, variant, icon, owner, avatars, primary, progress, caption, onClick }: ItemCardProps) {
  const label = [
    name,
    primary ? 'principal' : null,
    amount,
    progress !== undefined ? `${Math.round(Math.min(1, Math.max(0, progress)) * 100)} % pagado` : null,
    caption,
    owner ? `de ${owner}` : 'compartida',
  ]
    .filter(Boolean)
    .join(', ')

  const hasProgress = progress !== undefined
  const classes = [styles.card, styles[variant], hasProgress ? styles.withProgress : ''].filter(Boolean).join(' ')

  return (
    <button type="button" className={classes} onClick={onClick} aria-label={label}>
      <span className={styles.top}>
        <span className={styles.identity}>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.name}>{name}</span>
          {primary && <StarFilledIcon className={styles.star} aria-hidden="true" />}
        </span>
        {avatars}
      </span>

      <span className={styles.bottom}>
        <span className={`amount ${styles.amount}`}>{amount}</span>
        {progress !== undefined && (
          <span className={styles.progress}>
            <ProgressBar ratio={progress} trackColor="var(--tone-track)" fillColor="var(--tone-fill)" />
            {caption && <span className={styles.caption}>{caption}</span>}
          </span>
        )}
      </span>
    </button>
  )
}
