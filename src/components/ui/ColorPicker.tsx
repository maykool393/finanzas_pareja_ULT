import styles from './Picker.module.css'

export interface ColorOption {
  key: string
  label: string
  /** Valor CSS listo para usar en `background`, ej. "var(--account-a-bg)". */
  swatch: string
}

interface ColorPickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: ColorOption[]
}

/**
 * Nunca color libre: solo las variantes ya definidas en tokens.css, pasadas
 * por el módulo que llama (cuentas/deudas usan a/b, categorías las 4 familias).
 */
export function ColorPicker({ label = 'Color', value, onChange, options }: ColorPickerProps) {
  return (
    <div className={styles.field}>
      <span className="label">{label}</span>
      <div className={styles.grid} role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.key
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              className={selected ? `${styles.swatch} ${styles.swatchSelected}` : styles.swatch}
              style={{ background: option.swatch }}
              onClick={() => onChange(option.key)}
            />
          )
        })}
      </div>
    </div>
  )
}
