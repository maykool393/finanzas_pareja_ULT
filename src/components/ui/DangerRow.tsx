import type { ReactNode } from 'react'
import styles from './DangerRow.module.css'

/**
 * Fila de enlaces al pie de un diálogo de edición (Archivar, Eliminar),
 * separada del formulario por un divisor. Son enlaces de texto: la
 * confirmación, con su botón de color, llega en el diálogo siguiente.
 */
export function DangerRow({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>
}
