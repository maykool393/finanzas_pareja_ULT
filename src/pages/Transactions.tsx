import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DangerRow } from '../components/ui/DangerRow'
import { Dialog } from '../components/ui/Dialog'
import { LoadStatus } from '../components/ui/LoadStatus'
import { useAccounts } from '../features/accounts/useAccounts'
import { useCategories } from '../features/categories/useCategories'
import { TransactionFiltersBar } from '../features/transactions/TransactionFiltersBar'
import { TransactionForm } from '../features/transactions/TransactionForm'
import { TransactionList } from '../features/transactions/TransactionList'
import { useTransactions } from '../features/transactions/useTransactions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import type { Transaction, TransactionFilters } from '../types/domain'
import styles from './Transactions.module.css'

export function Transactions() {
  useDocumentTitle('Movimientos')
  const [filters, setFilters] = useState<TransactionFilters>({})
  const { transactions, loading, error, retry, create, update, remove } = useTransactions(filters)
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const { members } = useHouseholdMembers()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Movimientos</h1>
        <Button onClick={() => setFormOpen(true)}>Nuevo movimiento</Button>
      </div>

      <button type="button" className={styles.filtersToggle} onClick={() => setFiltersOpen((v) => !v)}>
        {filtersOpen ? 'Ocultar filtros' : 'Filtrar'}
      </button>

      {filtersOpen && (
        <TransactionFiltersBar
          filters={filters}
          onChange={setFilters}
          accounts={accounts}
          categories={categories}
          members={members}
        />
      )}

      <LoadStatus loading={loading} error={error} onRetry={retry}>
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          members={members}
          onSelect={(transaction) => setEditing(transaction)}
        />
      </LoadStatus>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="Nuevo movimiento">
        <TransactionForm
          onSubmit={async (input) => {
            await create(input)
            setFormOpen(false)
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Editar movimiento">
        {editing && (
          <>
            <TransactionForm
              initial={editing}
              onSubmit={async (input) => {
                await update(editing.id, input)
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
            />
            <DangerRow>
              <button
                type="button"
                onClick={() => {
                  setDeleting(editing)
                  setEditing(null)
                }}
              >
                Eliminar
              </button>
            </DangerRow>
          </>
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
        title="Eliminar movimiento"
        description="Esta acción no se puede deshacer. El saldo de la cuenta se ajusta automáticamente."
        tone="delete"
      />
    </div>
  )
}
