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
import type { Investment } from '../../types/domain'
import { InvestmentForm } from './InvestmentForm'
import sectionStyles from './InvestmentsSection.module.css'
import { useInvestments } from './useInvestments'

const DEFAULT_ICON = ACCOUNT_ICON_OPTIONS.find((o) => o.key === 'trend-up')!.key

export function InvestmentsSection() {
  const { investments, loading, create, update, toggleArchived, remove } = useInvestments()
  const { members } = useHouseholdMembers()

  const [expanded, setExpanded] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)
  const [archiving, setArchiving] = useState<Investment | null>(null)
  const [deleting, setDeleting] = useState<Investment | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const active = investments.filter((i) => !i.archivedAt)
  const archived = investments.filter((i) => i.archivedAt)
  const total = active.reduce((acc, i) => acc + i.currentValue, 0)

  function ownerName(ownerId: string | null) {
    if (!ownerId) return null
    return members.find((m) => m.id === ownerId)?.displayName ?? null
  }

  return (
    <section className={styles.section}>
      <SectionHeader
        title="Inversiones"
        total={formatCurrency(total)}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        onAdd={() => setFormOpen(true)}
      />

      {expanded && !loading && !showArchived && active.length === 0 && (
        <p className={styles.empty}>Sin inversiones todavía.</p>
      )}

      {expanded && !showArchived && active.length > 0 && (
        <div className={styles.cardRow}>
          {active.map((investment) => {
            const Icon = ICONS[(investment.icon as AccountIconKey) ?? DEFAULT_ICON] ?? ICONS[DEFAULT_ICON]
            return (
              <ItemCard
                key={investment.id}
                name={investment.name}
                amount={formatCurrency(investment.currentValue)}
                variant={(investment.colorVariant === 'b' ? 'investment-b' : 'investment-a') satisfies ItemVariant}
                icon={<Icon />}
                owner={ownerName(investment.ownerId)}
                onClick={() => setEditing(investment)}
              />
            )
          })}
        </div>
      )}

      {expanded && showArchived && (
        <ArchivedList
          items={archived}
          onUnarchive={async (investment) => {
            await toggleArchived(investment.id, false)
            setShowArchived(false)
          }}
          onDelete={(investment) => setDeleting(investment)}
          emptyLabel="Ninguna inversión archivada."
        />
      )}

      {expanded && archived.length > 0 && (
        <ArchivedToggle count={archived.length} showing={showArchived} onToggle={() => setShowArchived((v) => !v)} />
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title="Nueva inversión">
        <InvestmentForm
          onSubmit={async (input) => {
            await create(input)
            setFormOpen(false)
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title="Editar inversión">
        {editing && (
          <>
            <InvestmentForm
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
        title="Archivar inversión"
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
        title="Eliminar inversión"
        description={`Esta acción no se puede deshacer. Se eliminará "${deleting?.name}" de forma permanente.`}
        tone="delete"
        loading={confirmLoading}
      />
    </section>
  )
}
