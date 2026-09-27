import type { ReactNode } from 'react'
import { ERROR_MESSAGES } from '../../lib/errorMessages'
import styles from './LoadStatus.module.css'

interface LoadStatusProps {
  loading: boolean
  error: boolean
  onRetry: () => void
  children: ReactNode
}

/**
 * Estado de carga común a todas las listas: "Cargando…" mientras llega, el
 * error con "Reintentar" si falla, y el contenido cuando está. Así ninguna
 * lista muestra su estado vacío ("Sin cuentas todavía") antes de cargar.
 */
export function LoadStatus({ loading, error, onRetry, children }: LoadStatusProps) {
  if (error) return <LoadError onRetry={onRetry} />

  if (loading) {
    return (
      <p className={styles.loading} aria-busy="true">
        Cargando…
      </p>
    )
  }

  return <>{children}</>
}

/** El error de carga solo, para cuando no hay un contenido que envolver. */
export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <p>{ERROR_MESSAGES.load}</p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        Reintentar
      </button>
    </div>
  )
}
