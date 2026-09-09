import { ACCOUNT_ICON_OPTIONS, ICONS, type IconKey } from './icons'
import styles from './Picker.module.css'

interface IconPickerProps {
  label?: string
  value: IconKey
  onChange: (value: IconKey) => void
  options?: { key: IconKey; label: string }[]
}

export function IconPicker({ label = 'Ícono', value, onChange, options = ACCOUNT_ICON_OPTIONS }: IconPickerProps) {
  return (
    <div className={styles.field}>
      <span className="label">{label}</span>
      <div className={styles.grid} role="radiogroup" aria-label={label}>
        {options.map(({ key, label: optionLabel }) => {
          const Icon = ICONS[key]
          const selected = value === key
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={optionLabel}
              className={selected ? `${styles.option} ${styles.optionSelected}` : styles.option}
              onClick={() => onChange(key)}
            >
              <Icon />
            </button>
          )
        })}
      </div>
    </div>
  )
}
