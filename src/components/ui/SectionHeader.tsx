import { ChevronDownIcon, PlusIcon } from './icons'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
  /** Se omite mientras carga o si falló: un $0 provisorio parecería un saldo real. */
  total?: string
  expanded: boolean
  onToggle: () => void
  onAdd?: () => void
}

export function SectionHeader({ title, total, expanded, onToggle, onAdd }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      {/* El título es un encabezado (navegable con los atajos del lector de
          pantalla) que contiene el botón: el patrón de acordeón de WAI-ARIA. */}
      <h2 className={styles.heading}>
        <button type="button" className={styles.toggle} onClick={onToggle} aria-expanded={expanded}>
          <span className={styles.title}>{title}</span>
          {/* Siempre presente, aunque vacío: su margen empuja el chevron a la derecha. */}
          <span className={`amount ${styles.total}`}>{total}</span>
          <ChevronDownIcon
            className={expanded ? `${styles.chevron} ${styles.chevronExpanded}` : styles.chevron}
            aria-hidden="true"
          />
        </button>
      </h2>
      {onAdd && (
        <button type="button" className={styles.add} onClick={onAdd} aria-label={`Agregar a ${title}`}>
          <PlusIcon />
        </button>
      )}
    </div>
  )
}
