import { useState } from 'react'
import { ArchivedList, ArchivedToggle } from '../../components/ui/ArchivedList'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Dialog } from '../../components/ui/Dialog'
import { ACCOUNT_ICON_OPTIONS, ICONS, type AccountIconKey } from '../../components/ui/icons'
import { ItemCard, type ItemVariant } from '../../components/ui/ItemCard'
import { SectionHeader } from '../../components/ui/SectionHeader'
import styles from '../../components/ui/sectionGrid.module.css'
import { useHouseholdMembers } from '../../hooks/useHouseholdMembers'
import { formatCurrency } from '../../lib/format'
import type { Debt } from '../../types/domain'
import { DebtForm } from './DebtForm'
import sectionStyles from './DebtsSection.module.css'
import { useDebts } from './useDebts'

const DEFAULT_ICON = ACCOUNT_ICON_OPTIONS.find((o) => o.key === 'card')!.key

export function DebtsSection() {
  const { debts, loading, create, update, toggleArchived, remove } = useDebts()
  const { members } = useHouseholdMembers()

  const [expanded, setExpanded] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Debt | null>(null)
  const [archiving, setArchiving] = useState<Debt | null>(null)
  const [deleting, setDeleting] = useState<Debt | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const active = debts.filter((d) => !d.archivedAt)
  const archived = debts.filter((d) => d.archivedAt)
  const total = active.reduce((acc, d) => acc + d.remaining, 0)

  function ownerName(ownerId: string | null) {
    if (!ownerId) return null
    return members.find((m) => m.id === ownerId)?.displayName ?? null
  }

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Deudas"
        total={formatCurrency(total)}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        onAdd={() => setFormOpen(true)}
      />

      {expanded && !loading && !showArchived && active.length === 0 && (
        <p className={styles.empty}>Sin deudas registradas.</p>
      )}

      {expanded && !showArchived && active.length > 0 && (
        <div className={styles.cardRow}>
          {active.map((debt) => {
            const Icon = ICONS[(debt.icon as AccountIconKey) ?? DEFAULT_ICON] ?? ICONS[DEFAULT_ICON]
            return (
              <ItemCard
                key={debt.id}
                name={debt.name}
                amount={formatCurrency(debt.remaining)}
                variant={(debt.colorVariant === 'b' ? 'debt-b' : 'debt-a') satisfies ItemVariant}
                icon={<Icon />}
                owner={ownerName(debt.ownerId)}
                progress={debt.principal > 0 ? (debt.principal - debt.remaining) / debt.principal : 0}
                onClick={() => setEditing(debt)}
              />
            )
          })}
        </div>
      )}

      {expanded && showArchived && (
        <ArchivedList
          items={archived}
          onUnarchive={async (debt) => {
            await toggleArchived(debt.id, false)
            setShowArchived(false)
          }}
          onDelete={(debt) => setDeleting(debt)}
          emptyLabel="Ninguna deuda archivada."
        />
      )}

      {expanded && archived.length > 0 && (
        <ArchivedToggle count={archived.length} showing={showArchived} onToggle={() => setShowArchived((v) => !v)} />
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="Nueva deuda">
        <DebtForm
          onSubmit={async (input) => {
            await create(input)
            setFormOpen(false)
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Editar deuda">
        {editing && (
          <>
            <DebtForm
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
        title="Archivar deuda"
        description={`"${archiving?.name}" dejará de aparecer en el dashboard. Puedes recuperarla cuando quieras.`}
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
        title="Eliminar deuda"
        description={`Esta acción no se puede deshacer. Se eliminará "${deleting?.name}" de forma permanente.`}
        tone="delete"
        loading={confirmLoading}
      />
    </section>
  )
}
