import { useAsyncAction } from '../../hooks/useAsyncAction'
import { ERROR_MESSAGES } from '../../lib/errorMessages'
import { FormError } from './FormError'
import styles from './ArchivedList.module.css'

interface ArchivedItem {
  id: string
  name: string
}

interface ArchivedListProps<T extends ArchivedItem> {
  items: T[]
  onUnarchive: (item: T) => Promise<void>
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
  const { pending, error, run } = useAsyncAction()

  if (items.length === 0) return <p className={styles.empty}>{emptyLabel}</p>

  return (
    <>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.row}>
            <span className={styles.name}>{item.name}</span>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => run(() => onUnarchive(item), ERROR_MESSAGES.unarchive)}
                disabled={pending}
              >
                Reactivar
              </button>
              <button type="button" onClick={() => onDelete(item)} disabled={pending}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <div className={styles.error}>
          <FormError>{error}</FormError>
        </div>
      )}
    </>
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
