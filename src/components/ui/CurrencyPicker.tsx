import { useId, useState } from 'react'
import { useRadioGroupKeys } from '../../hooks/useRadioGroupKeys'
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from '../../lib/format'
import styles from './CurrencyPicker.module.css'
import { Dialog } from './Dialog'
import { PlusIcon } from './icons'

interface CurrencyPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

/** Las que se ven sin abrir nada; el resto vive en el panel del "+". */
const QUICK_COUNT = 3

/**
 * Moneda del hogar (DESIGN.md § Selector de moneda): tres monedas a la vista y
 * un botón "+" que abre el resto en un panel (lateral en escritorio, hoja
 * inferior en móvil). Muestra símbolo y código juntos porque varias comparten
 * el "$". Es un radiogroup: una parada de Tab y flechas.
 */
export function CurrencyPicker({ value, onChange, label = 'Moneda principal' }: CurrencyPickerProps) {
  const labelId = useId()
  const sheetLabelId = useId()
  const [sheetOpen, setSheetOpen] = useState(false)

  // La elegida siempre se ve: si no está entre las rápidas, ocupa el último
  // lugar en vez de quedar escondida detrás del "+".
  const quick = SUPPORTED_CURRENCIES.slice(0, QUICK_COUNT)
  const visible = quick.includes(value) ? quick : [...quick.slice(0, QUICK_COUNT - 1), value]

  const radioProps = useRadioGroupKeys(visible, value, onChange)
  const sheetRadioProps = useRadioGroupKeys(SUPPORTED_CURRENCIES, value, onChange)

  function option(code: string, selected: boolean, props: Record<string, unknown>) {
    return (
      <button
        key={code}
        type="button"
        role="radio"
        aria-checked={selected}
        className={selected ? `${styles.option} ${styles.selected}` : styles.option}
        {...props}
      >
        <span className={styles.symbol} aria-hidden="true">
          {getCurrencySymbol(code)}
        </span>
        <span className={styles.code}>{code}</span>
      </button>
    )
  }

  return (
    <div className={styles.field}>
      <span className="label" id={labelId}>
        {label}
      </span>

      <div className={styles.grid}>
        {/* display: contents — la cuadrícula la arma .grid, pero el radiogroup
            no puede contener al botón "+", que no es una opción. */}
        <div className={styles.radios} role="radiogroup" aria-labelledby={labelId}>
          {visible.map((code, index) =>
            option(code, value === code, { onClick: () => onChange(code), ...radioProps(index) }),
          )}
        </div>

        <button
          type="button"
          className={styles.more}
          onClick={() => setSheetOpen(true)}
          aria-label="Ver más monedas"
        >
          <PlusIcon aria-hidden="true" />
        </button>
      </div>

      <Dialog open={sheetOpen} onClose={() => setSheetOpen(false)} title="Elige tu moneda" placement="side">
        <span className="label" id={sheetLabelId}>
          {label}
        </span>
        <div className={`${styles.grid} ${styles.sheetGrid}`} role="radiogroup" aria-labelledby={sheetLabelId}>
          {SUPPORTED_CURRENCIES.map((code, index) =>
            option(code, value === code, {
              onClick: () => {
                onChange(code)
                setSheetOpen(false)
              },
              ...sheetRadioProps(index),
            }),
          )}
        </div>
      </Dialog>
    </div>
  )
}
