import type { ReactNode } from 'react'
import styles from './FloatingButton.module.css'

interface FloatingButtonProps {
  /** Nombre accesible: el botón no tiene texto visible ("Añadir movimiento"). */
  label: string
  icon: ReactNode
  onClick: () => void
}

/**
 * Botón flotante de la acción de crear de una pantalla (DESIGN.md § Botones):
 * círculo de 52px con el degradado de marca, sobre la barra inferior.
 */
export function FloatingButton({ label, icon, onClick }: FloatingButtonProps) {
  return (
    <button type="button" className={styles.fab} aria-label={label} onClick={onClick}>
      {icon}
    </button>
  )
}
