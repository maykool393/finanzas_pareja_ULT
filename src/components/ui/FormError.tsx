import type { ReactNode } from 'react'
import styles from './FormError.module.css'

/** Error en línea de un formulario o acción. `role="alert"` lo anuncia al aparecer. */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className={styles.error} role="alert">
      {children}
    </p>
  )
}
