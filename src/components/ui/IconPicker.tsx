import { useRadioGroupKeys } from '../../hooks/useRadioGroupKeys'
import { ACCOUNT_ICON_OPTIONS, ICONS, type IconKey } from './iconRegistry'
import styles from './Picker.module.css'

interface IconPickerProps {
  label?: string
  value: IconKey
  onChange: (value: IconKey) => void
  options?: { key: IconKey; label: string }[]
}

export function IconPicker({ label = 'Ícono', value, onChange, options = ACCOUNT_ICON_OPTIONS }: IconPickerProps) {
  const radioProps = useRadioGroupKeys(options.map((o) => o.key), value, onChange)

  return (
    <div className={styles.field}>
      <span className="label">{label}</span>
      <div className={styles.grid} role="radiogroup" aria-label={label}>
        {options.map(({ key, label: optionLabel }, index) => {
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
              {...radioProps(index)}
            >
              <Icon />
            </button>
          )
        })}
      </div>
    </div>
  )
}
