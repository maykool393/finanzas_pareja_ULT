import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Dialog } from '../components/ui/Dialog'
import { EmptyState } from '../components/ui/EmptyState'
import { FormError } from '../components/ui/FormError'
import { LoadStatus } from '../components/ui/LoadStatus'
import { SkeletonRows } from '../components/ui/Skeleton'
import { CategoryForm } from '../features/categories/CategoryForm'
import { CategoryList } from '../features/categories/CategoryList'
import { SUGGESTED_CATEGORIES } from '../features/categories/suggested'
import { useCategories } from '../features/categories/useCategories'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ERROR_MESSAGES } from '../lib/errorMessages'
import type { Category } from '../types/domain'
import styles from './Categories.module.css'

/** Todas las sugeridas ya existen (archivadas): no hay nada que crear. */
class AllSuggestionsExist extends Error {}

export function Categories() {
  useDocumentTitle('Categorías')
  const { categories, loading, error, retry, create, createMany, update, toggleArchived, remove } = useCategories()

  const unarchive = useAsyncAction()
  const suggested = useAsyncAction()
  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [archiving, setArchiving] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const active = categories.filter((c) => !c.archivedAt)
  // Las sugeridas que no existen todavía (ni archivadas): un nombre repetido
  // hacía fallar la creación de todas, porque el hogar no admite nombres iguales.
  const existingNames = new Set(categories.map((c) => c.name.trim().toLowerCase()))
  const missingSuggestions = SUGGESTED_CATEGORIES.filter((c) => !existingNames.has(c.name.toLowerCase()))
  const archived = categories.filter((c) => c.archivedAt)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Categorías</h1>
        <Button onClick={() => setFormOpen(true)}>Nueva categoría</Button>
      </div>

      <LoadStatus loading={loading} error={error} onRetry={retry} skeleton={<SkeletonRows />}>
        {!showArchived && active.length === 0 ? (
          <EmptyState
            title="Aún no hay categorías"
            description="Ordenan los movimientos (Supermercado, Sueldo…) y permiten poner presupuestos. Empieza con las más comunes y ajústalas después, o crea las tuyas."
            action={
              <div className={styles.emptyActions}>
                <Button
                  onClick={() =>
                    suggested.run(
                      async () => {
                        if (missingSuggestions.length === 0) throw new AllSuggestionsExist()
                        await createMany(missingSuggestions)
                      },
                      (err) =>
                        err instanceof AllSuggestionsExist
                          ? 'Las categorías sugeridas ya existen, archivadas. Reactívalas desde "Ver archivadas".'
                          : ERROR_MESSAGES.save,
                    )
                  }
                  disabled={suggested.pending}
                >
                  {suggested.pending ? 'Creando…' : 'Usar las sugeridas'}
                </Button>
                <Button variant="secondary" onClick={() => setFormOpen(true)} disabled={suggested.pending}>
                  Crear la primera
                </Button>
              </div>
            }
          />
        ) : showArchived ? (
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

        {suggested.error && <FormError>{suggested.error}</FormError>}
        {unarchive.error && <FormError>{unarchive.error}</FormError>}

        {/* Sin archivadas no hay nada que ver: antes decía "Ver archivadas (0)". */}
        {(archived.length > 0 || showArchived) && (
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
        )}
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
