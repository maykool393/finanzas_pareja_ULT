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
}: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span className="label">{label}</span>
      <input
        className={styles.input}
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
