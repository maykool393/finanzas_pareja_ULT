import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Dialog } from '../components/ui/Dialog'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadStatus } from '../components/ui/LoadStatus'
import { SkeletonRows } from '../components/ui/Skeleton'
import { BudgetForm } from '../features/budgets/BudgetForm'
import { BudgetList } from '../features/budgets/BudgetList'
import { useBudgets } from '../features/budgets/useBudgets'
import { useCategories } from '../features/categories/useCategories'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatMonth } from '../lib/format'
import type { BudgetProgress } from '../types/domain'
import styles from './Budgets.module.css'

export function Budgets() {
  useDocumentTitle('Presupuesto')
  const { budgets, loading, error, retry, periodMonth, create, update, remove } = useBudgets()
  const { categories, loading: categoriesLoading } = useCategories()
  const navigate = useNavigate()
  const hasCategories = categories.some((c) => !c.archivedAt)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetProgress | null>(null)
  const [deleting, setDeleting] = useState<BudgetProgress | null>(null)

  const existingCategoryIds = budgets.map((b) => b.categoryId)
  const deletingCategoryName = categories.find((c) => c.id === deleting?.categoryId)?.name

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Presupuesto · {formatMonth(new Date())}</h1>
        <Button onClick={() => setFormOpen(true)}>Nuevo presupuesto</Button>
      </div>

      <LoadStatus loading={loading} error={error} onRetry={retry} skeleton={<SkeletonRows />}>
        <BudgetList
          budgets={budgets}
          categories={categories}
          onEdit={(budget) => setEditing(budget)}
          onDelete={(budget) => setDeleting(budget)}
          empty={
            !categoriesLoading && !hasCategories ? (
              <EmptyState
                title="Primero, categorías"
                description="Cada presupuesto es un límite de gasto (o una meta de ingreso) para una categoría, y todavía no hay ninguna."
                action={
                  <Button variant="secondary" onClick={() => navigate('/categorias')}>
                    Ir a Categorías
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="Sin presupuestos este mes"
                description="Pon un límite de gasto por categoría: la barra muestra cuánto va del mes y cambia de color al acercarse al límite."
                action={
                  <Button variant="secondary" onClick={() => setFormOpen(true)}>
                    Crear el primero
                  </Button>
                }
              />
            )
          }
        />
      </LoadStatus>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="Nuevo presupuesto">
        <BudgetForm
          periodMonth={periodMonth}
          existingCategoryIds={existingCategoryIds}
          onSubmit={async (input) => {
            await create(input)
            setFormOpen(false)
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Editar presupuesto">
        {editing && (
          <BudgetForm
            initial={editing}
            periodMonth={periodMonth}
            existingCategoryIds={existingCategoryIds}
            onSubmit={async (input) => {
              await update(editing.id, input.amount)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return
          await remove(deleting.id)
          setDeleting(null)
        }}
        title="Eliminar presupuesto"
        description={`Se eliminará el límite de "${deletingCategoryName}" para este mes.`}
        tone="delete"
      />
    </div>
  )
}
