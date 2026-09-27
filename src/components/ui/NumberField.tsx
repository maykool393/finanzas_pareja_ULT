import { useMemo, useState } from 'react'
import { useCurrency } from '../../hooks/useCurrency'
import { formatAmount, getCurrencyDecimals, getCurrencySymbol, parseAmount } from '../../lib/format'
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
  /**
   * Campo de monto: antepone el símbolo de la moneda del household (€, S/, $...)
   * y acepta sus decimales (centavos en EUR, USD, PEN...). Con false es un
   * entero (ej. número de cuotas).
   */
  currency?: boolean
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

  const currencyCode = useCurrency()
  const symbol = useMemo(() => getCurrencySymbol(currencyCode), [currencyCode])
  const decimals = currency ? getCurrencyDecimals(currencyCode) : 0

  // Sin foco: formateado ("1.234,50"). Con foco: lo que se escribe, tal cual.
  const displayValue = focused ? raw : value === null ? '' : formatAmount(value, decimals)

  return (
    <label className={styles.field}>
      <span className="label">{label}</span>
      {/* <span> y no <div>: dentro de un <label> solo va contenido en línea. */}
      <span className={numberFieldStyles.wrapper}>
        {currency && <span className={numberFieldStyles.prefix}>{symbol}</span>}
        <input
          className={`${styles.input} ${currency ? numberFieldStyles.withPrefix : ''}`}
          type="text"
          // Con decimales, el teclado del celular muestra la coma; sin ellos, solo dígitos.
          inputMode={decimals > 0 ? 'decimal' : 'numeric'}
          required={required}
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => {
            setFocused(true)
            // Sin separador de miles y con coma decimal, para editarlo cómodo: "1234,5".
            setRaw(value === null ? '' : String(value).replace('.', ','))
          }}
          onBlur={() => {
            setFocused(false)
            if (value !== null && (min !== undefined || max !== undefined)) {
              onChange(clamp(value, min, max))
            }
          }}
          onChange={(e) => {
            setRaw(e.target.value)
            onChange(parseAmount(e.target.value, decimals))
          }}
        />
      </span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  )
}
