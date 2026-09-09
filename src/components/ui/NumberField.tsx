import { useState } from 'react'
import { formatAmount } from '../../lib/format'
import styles from './formField.module.css'
import numberFieldStyles from './NumberField.module.css'

interface NumberFieldProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  required?: boolean
  placeholder?: string
  hint?: string
  /** Antepone "$" al campo — para montos en pesos. */
  currency?: boolean
}

function parseDigits(raw: string): number | null {
  const cleaned = raw.replace(/[^\d-]/g, '')
  if (cleaned === '' || cleaned === '-') return null
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? null : parsed
}

function clamp(value: number, min?: number, max?: number) {
  let result = value
  if (min !== undefined) result = Math.max(min, result)
  if (max !== undefined) result = Math.min(max, result)
  return result
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  required,
  placeholder,
  hint,
  currency = true,
}: NumberFieldProps) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')

  const displayValue = focused ? raw : value === null ? '' : formatAmount(value)

  return (
    <label className={styles.field}>
      <span className="label">{label}</span>
      <div className={numberFieldStyles.wrapper}>
        {currency && <span className={numberFieldStyles.prefix}>$</span>}
        <input
          className={`${styles.input} ${currency ? numberFieldStyles.withPrefix : ''}`}
          type="text"
          inputMode="decimal"
          required={required}
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => {
            setFocused(true)
            setRaw(value === null ? '' : String(value))
          }}
          onBlur={() => {
            setFocused(false)
            if (value !== null && (min !== undefined || max !== undefined)) {
              onChange(clamp(value, min, max))
            }
          }}
          onChange={(e) => {
            setRaw(e.target.value)
            onChange(parseDigits(e.target.value))
          }}
        />
      </div>
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  )
}
