import { useId } from 'react'
import { useRadioGroupKeys } from '../../hooks/useRadioGroupKeys'
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from '../../lib/format'
import styles from './CurrencyPicker.module.css'

interface CurrencyPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

/**
 * Moneda del hogar (DESIGN.md § Selector de moneda): las siete monedas de
 * format.ts en una cuadrícula. Muestra símbolo y código juntos porque varias
 * comparten el "$". Es un radiogroup: una parada de Tab y flechas.
 */
export function CurrencyPicker({ value, onChange, label = 'Moneda principal' }: CurrencyPickerProps) {
  const labelId = useId()
  const radioProps = useRadioGroupKeys(SUPPORTED_CURRENCIES, value, onChange)

  return (
    <div className={styles.field}>
      <span className="label" id={labelId}>
        {label}
      </span>
      <div className={styles.grid} role="radiogroup" aria-labelledby={labelId}>
        {SUPPORTED_CURRENCIES.map((code, index) => {
          const selected = value === code
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={selected}
              className={selected ? `${styles.option} ${styles.selected}` : styles.option}
              onClick={() => onChange(code)}
              {...radioProps(index)}
            >
              <span className={styles.symbol} aria-hidden="true">
                {getCurrencySymbol(code)}
              </span>
              <span className={styles.code}>{code}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
