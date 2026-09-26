import type { ReactNode } from 'react'
import styles from './RadioListGroup.module.css'

interface RadioListOption<T extends string> {
  value: T
  label: string
  description: string
  icon: ReactNode
}

interface RadioListGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly RadioListOption<T>[]
  label: string
}

/** Lista de opciones tipo radio con descripción — variante de fila del mismo
 * patrón de RadioCardGroup (ver DESIGN.md § Tarjeta de selección). */
export function RadioListGroup<T extends string>({ value, onChange, options, label }: RadioListGroupProps<T>) {
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
            className={selected ? `${styles.row} ${styles.selected}` : styles.row}
            onClick={() => onChange(option.value)}
          >
            <span className={styles.icon}>{option.icon}</span>
            <span className={styles.text}>
              <span className={styles.title}>{option.label}</span>
              <span className={styles.description}>{option.description}</span>
            </span>
            <span className={styles.radio} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
