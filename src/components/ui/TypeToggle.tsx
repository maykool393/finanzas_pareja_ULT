import { useRadioGroupKeys } from '../../hooks/useRadioGroupKeys'
import styles from './TypeToggle.module.css'

interface TypeToggleOption<T extends string> {
  value: T
  label: string
}

interface TypeToggleProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly [TypeToggleOption<T>, TypeToggleOption<T>]
  label?: string
}

/** Toggle binario (Gasto/Ingreso, etc.) — usado por Categorías y Transacciones. */
export function TypeToggle<T extends string>({ value, onChange, options, label = 'Tipo' }: TypeToggleProps<T>) {
  const radioProps = useRadioGroupKeys(options.map((o) => o.value), value, onChange)

  return (
    <div className={styles.toggle} role="radiogroup" aria-label={label}>
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? `${styles.option} ${styles.selected}` : styles.option}
          onClick={() => onChange(option.value)}
          {...radioProps(index)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
