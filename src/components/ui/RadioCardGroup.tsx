import type { ReactNode } from 'react'
import styles from './RadioCardGroup.module.css'

interface RadioCardOption<T extends string> {
  value: T
  label: string
  icon: ReactNode
}

interface RadioCardGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly [RadioCardOption<T>, RadioCardOption<T>]
  label: string
}

/** Par de tarjetas de selección tipo radio — ver DESIGN.md § Tarjeta de selección (radio-card). */
export function RadioCardGroup<T extends string>({ value, onChange, options, label }: RadioCardGroupProps<T>) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? `${styles.card} ${styles.selected}` : styles.card}
            onClick={() => onChange(option.value)}
          >
            <span className={styles.icon}>{option.icon}</span>
            <span className={styles.label}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
