import { ChevronDownIcon, PlusIcon } from './icons'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: string
  total: string
  expanded: boolean
  onToggle: () => void
  onAdd?: () => void
}

export function SectionHeader({ title, total, expanded, onToggle, onAdd }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <button type="button" className={styles.toggle} onClick={onToggle} aria-expanded={expanded}>
        <span className={styles.title}>{title}</span>
        <span className={`amount ${styles.total}`}>{total}</span>
        <ChevronDownIcon
          className={expanded ? `${styles.chevron} ${styles.chevronExpanded}` : styles.chevron}
          aria-hidden="true"
        />
      </button>
      {onAdd && (
        <button type="button" className={styles.add} onClick={onAdd} aria-label={`Agregar a ${title}`}>
          <PlusIcon />
        </button>
      )}
    </div>
  )
}
