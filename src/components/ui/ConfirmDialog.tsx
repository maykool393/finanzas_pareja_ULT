import { useAsyncAction } from '../../hooks/useAsyncAction'
import { ERROR_MESSAGES } from '../../lib/errorMessages'
import { Dialog } from './Dialog'
import { FormError } from './FormError'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  /** Hace la acción y cierra el diálogo. Si lanza, el diálogo sigue abierto con el error. */
  onConfirm: () => Promise<void>
  title: string
  description: string
  confirmLabel?: string
  /** archive = reversible, tono neutro. delete = permanente, tono de alerta. */
  tone?: 'archive' | 'delete'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = 'archive',
}: ConfirmDialogProps) {
  const { pending, error, run, reset } = useAsyncAction()

  // Mientras corre la acción no se puede cerrar: el resultado llegaría a un
  // diálogo que ya no está. Al cerrar se borra el error, para que no aparezca
  // la próxima vez que se abra.
  function handleClose() {
    if (pending) return
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} title={title}>
      <p className={styles.description}>{description}</p>
      {error && (
        <div className={styles.error}>
          <FormError>{error}</FormError>
        </div>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={handleClose} disabled={pending}>
          Cancelar
        </button>
        <button
          type="button"
          className={tone === 'delete' ? styles.confirmDelete : styles.confirmArchive}
          onClick={() => run(onConfirm, tone === 'delete' ? ERROR_MESSAGES.delete : ERROR_MESSAGES.archive)}
          disabled={pending}
        >
          {pending ? 'Un momento…' : (confirmLabel ?? (tone === 'delete' ? 'Eliminar' : 'Archivar'))}
        </button>
      </div>
    </Dialog>
  )
}
