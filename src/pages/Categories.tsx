import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Dialog } from '../components/ui/Dialog'
import { CategoryForm } from '../features/categories/CategoryForm'
import { CategoryList } from '../features/categories/CategoryList'
import { useCategories } from '../features/categories/useCategories'
import type { Category } from '../types/domain'
import styles from './Categories.module.css'

export function Categories() {
  const { categories, loading, create, update, toggleArchived, remove } = useCategories()

  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [archiving, setArchiving] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const active = categories.filter((c) => !c.archivedAt)
  const archived = categories.filter((c) => c.archivedAt)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categorías</h1>
        <Button onClick={() => setFormOpen(true)}>Nueva categoría</Button>
      </div>

      {loading ? (
        <p className={styles.empty}>Cargando…</p>
      ) : showArchived ? (
        <CategoryList
          categories={archived}
          archived
          onUnarchive={async (c) => {
            await toggleArchived(c.id, false)
            setShowArchived(false)
          }}
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

      {!loading && (
        <button type="button" className={styles.archivedToggle} onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? 'Ver activas' : `Ver archivadas (${archived.length})`}
        </button>
      )}

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
          setConfirmLoading(true)
          await toggleArchived(archiving.id, true)
          setConfirmLoading(false)
          setArchiving(null)
        }}
        title="Archivar categoría"
        description={`"${archiving?.name}" dejará de aparecer al registrar movimientos. Los movimientos ya guardados con esta categoría se conservan.`}
        tone="archive"
        loading={confirmLoading}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return
          setConfirmLoading(true)
          await remove(deleting.id)
          setConfirmLoading(false)
          setDeleting(null)
        }}
        title="Eliminar categoría"
        description={`Esta acción no se puede deshacer. Se eliminará "${deleting?.name}" de forma permanente.`}
        tone="delete"
        loading={confirmLoading}
      />
    </div>
  )
}
