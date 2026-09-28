import { IconButton } from './IconButton'
import { PlusIcon } from './icons'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
  /** Se omite mientras carga o si falló: un $0 provisorio parecería un saldo real. */
  total?: string
  onAdd?: () => void
  /** Nombre accesible del botón +, ej. "Añadir cuenta". */
  addLabel?: string
}

/**
 * Encabezado de Cuentas, Deudas e Inversiones. Las secciones no se pliegan
 * (DESIGN.md § Encabezado de sección): título, total y el botón para agregar.
 */
export function SectionHeader({ title, total, onAdd, addLabel }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <span className={styles.end}>
        {total && <span className={`amount ${styles.total}`}>{total}</span>}
        {onAdd && (
          <IconButton label={addLabel ?? `Añadir a ${title}`} icon={<PlusIcon />} size={24} onClick={onAdd} />
        )}
      </span>
    </div>
  )
}
