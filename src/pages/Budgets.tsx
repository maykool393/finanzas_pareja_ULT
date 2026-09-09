import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Dialog } from '../components/ui/Dialog'
import { BudgetForm } from '../features/budgets/BudgetForm'
import { BudgetList } from '../features/budgets/BudgetList'
import { useBudgets } from '../features/budgets/useBudgets'
import { useCategories } from '../features/categories/useCategories'
import { formatMonth } from '../lib/format'
import type { BudgetProgress } from '../types/domain'
import styles from './Budgets.module.css'

export function Budgets() {
  const { budgets, loading, periodMonth, create, update, remove } = useBudgets()
  const { categories } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetProgress | null>(null)
  const [deleting, setDeleting] = useState<BudgetProgress | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const existingCategoryIds = budgets.map((b) => b.categoryId)
  const deletingCategoryName = categories.find((c) => c.id === deleting?.categoryId)?.name

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Presupuesto · {formatMonth(new Date())}</h1>
        <Button onClick={() => setFormOpen(true)}>Nuevo presupuesto</Button>
      </div>

      {loading ? (
        <p className={styles.empty}>Cargando…</p>
      ) : (
        <BudgetList
          budgets={budgets}
          categories={categories}
          onEdit={(budget) => setEditing(budget)}
          onDelete={(budget) => setDeleting(budget)}
        />
      )}

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
          setConfirmLoading(true)
          await remove(deleting.id)
          setConfirmLoading(false)
          setDeleting(null)
        }}
        title="Eliminar presupuesto"
        description={`Se eliminará el límite de "${deletingCategoryName}" para este mes.`}
        tone="delete"
        loading={confirmLoading}
      />
    </div>
  )
}
