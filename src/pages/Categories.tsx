import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Dialog } from '../components/ui/Dialog'
import { FormError } from '../components/ui/FormError'
import { LoadStatus } from '../components/ui/LoadStatus'
import { CategoryForm } from '../features/categories/CategoryForm'
import { CategoryList } from '../features/categories/CategoryList'
import { useCategories } from '../features/categories/useCategories'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ERROR_MESSAGES } from '../lib/errorMessages'
import type { Category } from '../types/domain'
import styles from './Categories.module.css'

export function Categories() {
  useDocumentTitle('Categorías')
  const { categories, loading, error, retry, create, update, toggleArchived, remove } = useCategories()

  const unarchive = useAsyncAction()
  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [archiving, setArchiving] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const active = categories.filter((c) => !c.archivedAt)
  const archived = categories.filter((c) => c.archivedAt)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categorías</h1>
        <Button onClick={() => setFormOpen(true)}>Nueva categoría</Button>
      </div>

      <LoadStatus loading={loading} error={error} onRetry={retry}>
        {showArchived ? (
          <CategoryList
            categories={archived}
            archived
            onUnarchive={(c) =>
              unarchive.run(async () => {
                await toggleArchived(c.id, false)
                setShowArchived(false)
              }, ERROR_MESSAGES.unarchive)
            }
            onDelete={(c) => setDeleting(c)}
          />
        ) : (
          <CategoryList
            categories={active}
            onEdit={(category) => setEditing(category)}
            onArchive={(category) => setArchiving(category)}
            onDelete={(category) => setDeleting(category)}
          />
        )}

        {unarchive.error && <FormError>{unarchive.error}</FormError>}

        <button
          type="button"
          className={styles.archivedToggle}
          onClick={() => {
            unarchive.reset()
            setShowArchived((v) => !v)
          }}
        >
          {showArchived ? 'Ver activas' : `Ver archivadas (${archived.length})`}
        </button>
      </LoadStatus>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="Nueva categoría">
        <CategoryForm
          onSubmit={async (input) => {
            await create(input)
            setFormOpen(false)
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Editar categoría">
        {editing && (
          <CategoryForm
            initial={editing}
            onSubmit={async (input) => {
              await update(editing.id, input)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={archiving !== null}
        onClose={() => setArchiving(null)}
        onConfirm={async () => {
          if (!archiving) return
          await toggleArchived(archiving.id, true)
          setArchiving(null)
        }}
        title="Archivar categoría"
        description={`"${archiving?.name}" dejará de aparecer al registrar movimientos. Los movimientos ya guardados con esta categoría se conservan.`}
        tone="archive"
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return
          await remove(deleting.id)
          setDeleting(null)
        }}
        title="Eliminar categoría"
        description={`Esta acción no se puede deshacer. Se eliminará "${deleting?.name}" de forma permanente.`}
        tone="delete"
      />
    </div>
  )
}
