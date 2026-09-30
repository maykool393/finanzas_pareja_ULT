import styles from './Checkbox.module.css'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** Explicación bajo la etiqueta: qué pasa al marcarla. */
  hint?: string
}

/**
 * Casilla nativa (el navegador la anuncia y la maneja con teclado), con la
 * marca en --brand-strong vía accent-color (global.css). Toda la fila es la
 * zona de toque: 44px de alto.
 */
export function Checkbox({ label, checked, onChange, hint }: CheckboxProps) {
  return (
    <label className={styles.row}>
      <input type="checkbox" className={styles.box} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
    </label>
  )
}
