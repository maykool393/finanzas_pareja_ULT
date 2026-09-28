import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './IconButton.module.css'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  /** Nombre accesible: el botón no tiene texto visible. */
  label: string
  icon: ReactNode
  /** Tamaño visible; la zona de toque siempre llega a 44px. */
  size?: 24 | 28 | 34
  /** `onHeader`: sobre la cabecera azul marino (fondo blanco translúcido, ícono blanco). */
  tone?: 'default' | 'onHeader'
}

/**
 * Botón de solo ícono: circular, con fondo propio (DESIGN.md § Botones). Se ve
 * de 24 a 34px y se toca en 44px, con un pseudo-elemento invisible.
 */
export function IconButton({ label, icon, size = 28, tone = 'default', className, type = 'button', ...props }: IconButtonProps) {
  const classes = [styles.button, styles[`size${size}`], tone === 'onHeader' ? styles.onHeader : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} aria-label={label} {...props}>
      {icon}
    </button>
  )
}
