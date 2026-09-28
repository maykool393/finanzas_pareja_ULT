import type { ReactNode } from 'react'
import { useRadioGroupKeys } from '../../hooks/useRadioGroupKeys'
import { CheckIcon } from './icons'
import styles from './OptionRows.module.css'

interface OptionRow<T extends string> {
  value: T
  title: string
  description: string
  /** Ilustración decorativa; toma el color de la fila con currentColor. */
  illustration: ReactNode
}

interface OptionRowsProps<T extends string> {
  value: T | null
  onChange: (value: T) => void
  options: readonly OptionRow<T>[]
  label: string
}

/**
 * Filas de opción a todo el ancho, con ilustración (DESIGN.md § Filas de
 * opción): el tipo de cuenta del onboarding. Es un radiogroup: una sola parada
 * de Tab y flechas para moverse (useRadioGroupKeys).
 */
export function OptionRows<T extends string>({ value, onChange, options, label }: OptionRowsProps<T>) {
  const radioProps = useRadioGroupKeys(
    options.map((o) => o.value),
    value ?? options[0].value,
    onChange,
  )

  return (
    <div className={styles.group} role="radiogroup" aria-label={label}>
      {options.map((option, index) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? `${styles.row} ${styles.selected}` : styles.row}
            onClick={() => onChange(option.value)}
            {...radioProps(index)}
          >
            {selected && <CheckIcon className={styles.check} aria-hidden="true" />}
            <span className={styles.illustration}>{option.illustration}</span>
            <span className={styles.title}>{option.title}</span>
            <span className={styles.description}>{option.description}</span>
          </button>
        )
      })}
    </div>
  )
}
