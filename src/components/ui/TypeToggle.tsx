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
  return (
    <div className={styles.toggle} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? `${styles.option} ${styles.selected}` : styles.option}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
