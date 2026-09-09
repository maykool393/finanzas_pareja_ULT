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
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={expanded ? `${styles.chevron} ${styles.chevronExpanded}` : styles.chevron}
          aria-hidden="true"
        >
          <path d="m6 8 4 4 4-4" />
        </svg>
      </button>
      {onAdd && (
        <button type="button" className={styles.add} onClick={onAdd} aria-label={`Agregar a ${title}`}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M10 4v12M4 10h12" />
          </svg>
        </button>
      )}
    </div>
  )
}
