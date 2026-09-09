import styles from './ArchivedList.module.css'

interface ArchivedItem {
  id: string
  name: string
}

interface ArchivedListProps<T extends ArchivedItem> {
  items: T[]
  onUnarchive: (item: T) => void
  onDelete: (item: T) => void
  emptyLabel?: string
}

/** Fila simple y apagada para lo archivado — Cuentas/Deudas/Inversiones comparten esta vista. */
export function ArchivedList<T extends ArchivedItem>({
  items,
  onUnarchive,
  onDelete,
  emptyLabel = 'Ninguna archivada.',
}: ArchivedListProps<T>) {
  if (items.length === 0) return <p className={styles.empty}>{emptyLabel}</p>

  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.row}>
          <span className={styles.name}>{item.name}</span>
          <div className={styles.actions}>
            <button type="button" onClick={() => onUnarchive(item)}>
              Reactivar
            </button>
            <button type="button" onClick={() => onDelete(item)}>
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Enlace "Ver archivadas (N)" / "Ver activas" — el toggle de arriba. */
export function ArchivedToggle({
  count,
  showing,
  onToggle,
}: {
  count: number
  showing: boolean
  onToggle: () => void
}) {
  return (
    <button type="button" className={styles.toggle} onClick={onToggle}>
      {showing ? 'Ver activas' : `Ver archivadas (${count})`}
    </button>
  )
}
