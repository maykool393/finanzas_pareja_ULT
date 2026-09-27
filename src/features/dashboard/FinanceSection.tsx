import { type ReactNode, useState } from 'react'
import { ArchivedList, ArchivedToggle } from '../../components/ui/ArchivedList'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DangerRow } from '../../components/ui/DangerRow'
import { Dialog } from '../../components/ui/Dialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ICONS, type AccountIconKey } from '../../components/ui/iconRegistry'
import { ItemCard, type ItemVariant } from '../../components/ui/ItemCard'
import { LoadStatus } from '../../components/ui/LoadStatus'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { SkeletonCards } from '../../components/ui/Skeleton'
import styles from '../../components/ui/sectionGrid.module.css'
import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency } from '../../lib/format'
import type { ColorVariant, Profile } from '../../types/domain'

/** Lo que comparten cuentas, deudas e inversiones. */
export interface FinanceItem {
  id: string
  name: string
  ownerId: string | null
  icon: string
  colorVariant: ColorVariant
  archivedAt: string | null
}

/**
 * Los datos de la sección, que llegan desde Dashboard (no se cargan aquí):
 * así el patrimonio y los gráficos leen el mismo estado que las tarjetas, y
 * se actualizan cuando la sección guarda algo.
 */
export interface FinanceQuery<T> {
  items: T[]
  loading: boolean
  error: boolean
  retry: () => void
  toggleArchived: (id: string, archived: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
}

interface FinanceSectionProps<T extends FinanceItem> {
  kind: 'account' | 'debt' | 'investment'
  title: string
  query: FinanceQuery<T>
  members: Profile[]
  defaultIcon: AccountIconKey
  /** Monto de cada tarjeta. El total de la sección es la suma de las activas. */
  amount: (item: T) => number
  /** Solo deudas: proporción pagada (0–1). */
  progress?: (item: T) => number
  text: {
    /** Estado vacío que guía: qué va aquí, para qué sirve y el texto del botón para crear lo primero. */
    empty: { title: string; description: string; action: string }
    archivedEmpty: string
    createTitle: string
    editTitle: string
    archiveTitle: string
    deleteTitle: string
    archiveDescription: (name: string) => string
    deleteDescription: (name: string) => string
  }
  /** El formulario: vacío para crear (`item` null) o con el ítem para editar. Llama a `close` al guardar o cancelar. */
  renderForm: (item: T | null, close: () => void) => ReactNode
}

export function FinanceSection<T extends FinanceItem>({
  kind,
  title,
  query,
  members,
  defaultIcon,
  amount,
  progress,
  text,
  renderForm,
}: FinanceSectionProps<T>) {
  const currency = useCurrency()

  const [expanded, setExpanded] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [archiving, setArchiving] = useState<T | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)

  const active = query.items.filter((item) => !item.archivedAt)
  const archived = query.items.filter((item) => item.archivedAt)
  const total = active.reduce((acc, item) => acc + amount(item), 0)

  function ownerName(ownerId: string | null) {
    if (!ownerId) return null
    return members.find((m) => m.id === ownerId)?.displayName ?? null
  }

  return (
    <section className={styles.section}>
      <SectionHeader
        title={title}
        total={query.loading || query.error ? undefined : formatCurrency(total, currency)}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        onAdd={() => setFormOpen(true)}
      />

      {expanded && (
        <LoadStatus loading={query.loading} error={query.error} onRetry={query.retry} skeleton={<SkeletonCards />}>
          {!showArchived && active.length === 0 && (
            <EmptyState
              title={text.empty.title}
              description={text.empty.description}
              action={
                <Button variant="secondary" onClick={() => setFormOpen(true)}>
                  {text.empty.action}
                </Button>
              }
            />
          )}

          {!showArchived && active.length > 0 && (
            <div className={styles.cardRow}>
              {active.map((item) => {
                const Icon = ICONS[item.icon as AccountIconKey] ?? ICONS[defaultIcon]
                return (
                  <ItemCard
                    key={item.id}
                    name={item.name}
                    amount={formatCurrency(amount(item), currency)}
                    variant={`${kind}-${item.colorVariant === 'b' ? 'b' : 'a'}` satisfies ItemVariant}
                    icon={<Icon />}
                    owner={ownerName(item.ownerId)}
                    progress={progress?.(item)}
                    onClick={() => setEditing(item)}
                  />
                )
              })}
            </div>
          )}

          {showArchived && (
            <ArchivedList
              items={archived}
              onUnarchive={async (item) => {
                await query.toggleArchived(item.id, false)
                setShowArchived(false)
              }}
              onDelete={(item) => setDeleting(item)}
              emptyLabel={text.archivedEmpty}
            />
          )}

          {archived.length > 0 && (
            <ArchivedToggle count={archived.length} showing={showArchived} onToggle={() => setShowArchived((v) => !v)} />
          )}
        </LoadStatus>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={text.createTitle}>
        {renderForm(null, () => setFormOpen(false))}
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={text.editTitle}>
        {editing && (
          <>
            {renderForm(editing, () => setEditing(null))}
            <DangerRow>
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
            </DangerRow>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={archiving !== null}
        onClose={() => setArchiving(null)}
        onConfirm={async () => {
          if (!archiving) return
          await query.toggleArchived(archiving.id, true)
          setArchiving(null)
        }}
        title={text.archiveTitle}
        description={text.archiveDescription(archiving?.name ?? '')}
        tone="archive"
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return
          await query.remove(deleting.id)
          setDeleting(null)
        }}
        title={text.deleteTitle}
        description={text.deleteDescription(deleting?.name ?? '')}
        tone="delete"
      />
    </section>
  )
}
