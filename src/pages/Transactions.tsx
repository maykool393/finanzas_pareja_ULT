import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DangerRow } from '../components/ui/DangerRow'
import { Dialog } from '../components/ui/Dialog'
import { EmptyState } from '../components/ui/EmptyState'
import { FormError } from '../components/ui/FormError'
import { LoadStatus } from '../components/ui/LoadStatus'
import { SkeletonRows } from '../components/ui/Skeleton'
import { useAccounts } from '../features/accounts/useAccounts'
import { useCategories } from '../features/categories/useCategories'
import { SettlementDetails } from '../features/settlements/SettlementDetails'
import { TransactionFiltersBar } from '../features/transactions/TransactionFiltersBar'
import { TransactionForm } from '../features/transactions/TransactionForm'
import { TransactionList } from '../features/transactions/TransactionList'
import { useTransactions } from '../features/transactions/useTransactions'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import { ERROR_MESSAGES } from '../lib/errorMessages'
import type { Transaction, TransactionFilters } from '../types/domain'
import styles from './Transactions.module.css'

export function Transactions() {
  useDocumentTitle('Movimientos')
  const [filters, setFilters] = useState<TransactionFilters>({})
  const {
    transactions,
    hasMore,
    loading,
    error,
    retry,
    loadMore,
    loadingMore,
    loadMoreError,
    create,
    update,
    remove,
    removeSettlement,
  } = useTransactions(filters)
  const { accounts, loading: accountsLoading } = useAccounts()
  const navigate = useNavigate()
  const { categories } = useCategories()
  const { members } = useHouseholdMembers()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const hasFilters = Object.values(filters).some(Boolean)
  // ?nuevo=1: llega desde el botón flotante del Resumen ("Añadir movimiento"),
  // con el formulario ya abierto. El parámetro se quita al cerrarlo, para que
  // volver atrás o recargar no lo abra de nuevo.
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpenState] = useState(() => searchParams.has('nuevo'))
  function setFormOpen(open: boolean) {
    setFormOpenState(open)
    if (!open && searchParams.has('nuevo')) setSearchParams({}, { replace: true })
  }
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  // Un saldo de gastos compartidos: sus mitades cargadas. Se ve y se elimina, no se edita.
  const [transfer, setTransfer] = useState<Transaction[] | null>(null)
  const [deletingSettlement, setDeletingSettlement] = useState<string | null>(null)

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

      <LoadStatus loading={loading} error={error} onRetry={retry} skeleton={<SkeletonRows />}>
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          members={members}
          onSelect={(transaction) =>
            transaction.settlementId
              ? setTransfer(transactions.filter((t) => t.settlementId === transaction.settlementId))
              : setEditing(transaction)
          }
          empty={
            hasFilters ? (
              <EmptyState
                title="Sin resultados"
                description="Ningún movimiento coincide con estos filtros."
                action={
                  <Button variant="secondary" onClick={() => setFilters({})}>
                    Quitar filtros
                  </Button>
                }
              />
            ) : !accountsLoading && accounts.every((a) => a.archivedAt) ? (
              <EmptyState
                title="Primero, una cuenta"
                description="Cada movimiento entra o sale de una cuenta: el banco, el efectivo o una tarjeta. Crea la primera en Patrimonio y vuelve aquí."
                action={
                  <Button variant="secondary" onClick={() => navigate('/patrimonio')}>
                    Ir a Patrimonio
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="Aún no hay movimientos"
                description="Registra ingresos y gastos para ver en qué se va el dinero cada mes. El saldo de la cuenta se ajusta solo."
                action={
                  <Button variant="secondary" onClick={() => setFormOpen(true)}>
                    Registrar el primero
                  </Button>
                }
              />
            )
          }
        />

        {loadMoreError && <FormError>{ERROR_MESSAGES.load}</FormError>}

        {hasMore && (
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Cargando…' : 'Cargar más'}
          </Button>
        )}
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

      <Dialog open={transfer !== null} onClose={() => setTransfer(null)} title="Saldo de gastos compartidos">
        {transfer && (
          <>
            <SettlementDetails legs={transfer} accounts={accounts} members={members} />
            <DangerRow>
              <button
                type="button"
                onClick={() => {
                  setDeletingSettlement(transfer[0].settlementId)
                  setTransfer(null)
                }}
              >
                Eliminar saldo
              </button>
            </DangerRow>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={deletingSettlement !== null}
        onClose={() => setDeletingSettlement(null)}
        onConfirm={async () => {
          if (!deletingSettlement) return
          await removeSettlement(deletingSettlement)
          setDeletingSettlement(null)
        }}
        title="Eliminar saldo"
        description="Se eliminan la transferencia y sus dos movimientos, y los saldos de las cuentas vuelven atrás. El mes vuelve a quedar por saldar en el Resumen."
        tone="delete"
      />

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
