import styles from './formField.module.css'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  required?: boolean
}

export function Select({ label, value, onChange, options, required }: SelectProps) {
  return (
    <label className={styles.field}>
      <span className="label">{label}</span>
      <select
        className={styles.input}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
