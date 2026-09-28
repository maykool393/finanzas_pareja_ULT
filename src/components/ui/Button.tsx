import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `onDark`: contorno blanco, sobre la cabecera o la historia oscura (DESIGN.md § Botones). */
  variant?: 'primary' | 'secondary' | 'danger' | 'onDark'
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  const variantClass = styles[variant]
  return (
    <button
      type={type}
      className={className ? `${styles.base} ${variantClass} ${className}` : `${styles.base} ${variantClass}`}
      {...props}
    />
  )
}
