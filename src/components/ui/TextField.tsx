import type { InputHTMLAttributes } from 'react'
import styles from './formField.module.css'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'date'
  required?: boolean
  placeholder?: string
  hint?: string
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete']
  /**
   * `underline`: solo la línea de abajo, para el campo protagonista de un paso.
   * `code`: monoespaciado y centrado, para códigos. Ver DESIGN.md § Campos.
   */
  variant?: 'default' | 'underline' | 'code'
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  hint,
  autoComplete,
  variant = 'default',
}: TextFieldProps) {
  const inputClass = variant === 'default' ? styles.input : `${styles.input} ${styles[variant]}`

  return (
    <label className={styles.field}>
      <span className="label">{label}</span>
      <input
        className={inputClass}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  )
}
