import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  /** Qué no hay todavía, en pocas palabras: "Aún no hay cuentas". */
  title: string
  /** Para qué sirve lo que va a aparecer aquí, o qué falta hacer antes. */
  description: string
  /** El paso siguiente: casi siempre un botón para crear lo primero. */
  action?: ReactNode
}

/**
 * Estado vacío que guía: dice qué va a aparecer, para qué sirve y cómo
 * empezar. Reemplaza las frases sueltas ("Sin cuentas todavía."), que no
 * decían qué hacer. Ver DESIGN.md § Estados vacíos.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
