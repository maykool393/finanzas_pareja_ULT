import { Dialog } from './Dialog'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  /** archive = reversible, tono neutro. delete = permanente, tono de alerta. */
  tone?: 'archive' | 'delete'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = 'archive',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          type="button"
          className={tone === 'delete' ? styles.confirmDelete : styles.confirmArchive}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Un momento…' : (confirmLabel ?? (tone === 'delete' ? 'Eliminar' : 'Archivar'))}
        </button>
      </div>
    </Dialog>
  )
}
