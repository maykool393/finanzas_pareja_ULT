import { useState } from 'react'
import { ArchivedList, ArchivedToggle } from '../../components/ui/ArchivedList'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dialog } from '../../components/ui/Dialog'
import { ACCOUNT_ICON_OPTIONS, ICONS, type AccountIconKey } from '../../components/ui/icons'
import { ItemCard, type ItemVariant } from '../../components/ui/ItemCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import styles from '../../components/ui/sectionGrid.module.css'
import sectionStyles from './AccountsSection.module.css'
import { useHouseholdMembers } from '../../hooks/useHouseholdMembers'
import { formatCurrency } from '../../lib/format'
import type { Account } from '../../types/domain'
import { AccountForm } from './AccountForm'
import { useAccounts } from './useAccounts'

const DEFAULT_ICON = ACCOUNT_ICON_OPTIONS[0].key

export function AccountsSection() {
  const { accounts, loading, create, update, toggleArchived, remove } = useAccounts()
  const { members } = useHouseholdMembers()

  const [expanded, setExpanded] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [archiving, setArchiving] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const active = accounts.filter((a) => !a.archivedAt)
  const archived = accounts.filter((a) => a.archivedAt)
  const total = active.reduce((acc, a) => acc + a.balance, 0)

  function ownerName(ownerId: string | null) {
    if (!ownerId) return null
    return members.find((m) => m.id === ownerId)?.displayName ?? null
  }

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Cuentas"
        total={formatCurrency(total)}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        onAdd={() => setFormOpen(true)}
      />

      {expanded && !loading && !showArchived && active.length === 0 && (
        <p className={styles.empty}>Sin cuentas todavía.</p>
      )}

      {expanded && !showArchived && active.length > 0 && (
        <div className={styles.cardRow}>
          {active.map((account) => {
            const Icon = ICONS[(account.icon as AccountIconKey) ?? DEFAULT_ICON] ?? ICONS[DEFAULT_ICON]
            return (
              <ItemCard
                key={account.id}
                name={account.name}
                amount={formatCurrency(account.balance)}
                variant={(account.colorVariant === 'b' ? 'account-b' : 'account-a') satisfies ItemVariant}
                icon={<Icon />}
                owner={ownerName(account.ownerId)}
                onClick={() => setEditing(account)}
              />
            )
          })}
        </div>
      )}

      {expanded && showArchived && (
        <ArchivedList
          items={archived}
          onUnarchive={async (account) => {
            await toggleArchived(account.id, false)
            setShowArchived(false)
          }}
          onDelete={(account) => setDeleting(account)}
          emptyLabel="Ninguna cuenta archivada."
        />
      )}

      {expanded && archived.length > 0 && (
        <ArchivedToggle count={archived.length} showing={showArchived} onToggle={() => setShowArchived((v) => !v)} />
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="Nueva cuenta">
        <AccountForm
          onSubmit={async (input, initialBalance) => {
            await create(input, initialBalance)
            setFormOpen(false)
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Editar cuenta">
        {editing && (
          <>
            <AccountForm
              initial={editing}
              onSubmit={async (input) => {
                await update(editing.id, input)
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
            />
            <div className={sectionStyles.dangerRow}>
              <button
                type="button"
                onClick={() => {
                  setArchiving(editing)
                  setEditing(null)
                }}
              >
                Archivar
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleting(editing)
                  setEditing(null)
                }}
              >
                Eliminar
              </button>
            </div>
          </>
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
        title="Archivar cuenta"
        description={`"${archiving?.name}" dejará de aparecer en el dashboard. Sus movimientos se conservan y puedes recuperarla cuando quieras.`}
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
        title="Eliminar cuenta"
        description={`Esta acción no se puede deshacer. Se eliminará "${deleting?.name}" de forma permanente, junto con sus movimientos.`}
        tone="delete"
        loading={confirmLoading}
      />
    </section>
  )
}
