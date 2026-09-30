import { type CSSProperties, type ReactNode, useEffect, useState } from 'react'
import { ArchivedList, ArchivedToggle } from '../../components/ui/ArchivedList'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DangerRow } from '../../components/ui/DangerRow'
import { Dialog } from '../../components/ui/Dialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { HouseholdAvatars } from '../../components/ui/HouseholdAvatars'
import { ICONS, type AccountIconKey } from '../../components/ui/iconRegistry'
import { ItemCard, type ItemVariant } from '../../components/ui/ItemCard'
import { LoadStatus } from '../../components/ui/LoadStatus'
import { SectionHeader } from '../../components/ui/SectionHeader'
import { SkeletonCards, SkeletonRows } from '../../components/ui/Skeleton'
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
  /** Solo cuentas: la principal lleva la estrella. */
  isPrimary?: boolean
}

/**
 * Los datos de la sección, que llegan desde Patrimonio (no se cargan aquí):
 * así el total y la composición leen el mismo estado que las tarjetas, y
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
  /** Solo deudas: pie de la tarjeta, bajo la barra ("$173.000 · 48 pagos"). */
  caption?: (item: T) => string | null
  /**
   * Cómo se muestran los ítems activos, si no son tarjetas (inversiones: una
   * lista). Recibe los ítems, la función que abre la edición y la que abre el
   * formulario de crear con un contexto (ej. el grupo ya elegido).
   */
  renderActive?: (items: T[], edit: (item: T) => void, create: (context: string | null) => void) => ReactNode
  /**
   * Abre el formulario de crear desde fuera de la sección (el botón flotante
   * de Patrimonio). Cada vez que el número cambia, se abre.
   */
  createRequest?: number
  text: {
    /** Nombre accesible del botón + del encabezado, ej. "Añadir cuenta". */
    add: string
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
  /**
   * El formulario: vacío para crear (`item` null) o con el ítem para editar.
   * Llama a `close` al guardar o cancelar. `context` es el que se pasó al
   * abrir el de crear (ej. el grupo); null si se abrió con el botón +.
   */
  renderForm: (item: T | null, close: () => void, context: string | null) => ReactNode
}

export function FinanceSection<T extends FinanceItem>({
  kind,
  title,
  query,
  members,
  defaultIcon,
  amount,
  progress,
  caption,
  renderActive,
  createRequest,
  text,
  renderForm,
}: FinanceSectionProps<T>) {
  const currency = useCurrency()

  const [showArchived, setShowArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [createContext, setCreateContext] = useState<string | null>(null)

  function openCreate(context: string | null = null) {
    setCreateContext(context)
    setFormOpen(true)
  }

  // El botón flotante de Patrimonio pide abrir el formulario de esta sección.
  useEffect(() => {
    // Falso positivo del linter: abre el diálogo en respuesta a un pedido de
    // afuera (el número cambia), no deriva estado de las props.
    if (!createRequest) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCreateContext(null)
    setFormOpen(true)
  }, [createRequest])
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
      {/* En las secciones de tarjetas, el título queda fijo mientras se apilan (ver sectionGrid). */}
      <div className={renderActive ? undefined : styles.stickyTitle}>
        <SectionHeader
          title={title}
          total={query.loading || query.error ? undefined : formatCurrency(total, currency)}
          onAdd={() => openCreate(null)}
          addLabel={text.add}
        />
      </div>

      <LoadStatus loading={query.loading} error={query.error} onRetry={query.retry} skeleton={renderActive ? <SkeletonRows count={2} /> : <SkeletonCards />}>
        {!showArchived && active.length === 0 && (
          <EmptyState
            title={text.empty.title}
            description={text.empty.description}
            action={
              <Button variant="secondary" onClick={() => openCreate(null)}>
                {text.empty.action}
              </Button>
            }
          />
        )}

        {!showArchived && active.length > 0 && renderActive?.(active, setEditing, openCreate)}

        {!showArchived && active.length > 0 && !renderActive && (
          <div className={`${styles.cardRow} ${styles.stack}`}>
            {active.map((item, index) => {
              const Icon = ICONS[item.icon as AccountIconKey] ?? ICONS[defaultIcon]
              return (
                <div key={item.id} className={styles.stackItem} style={{ '--stack-index': index } as CSSProperties}>
                  <ItemCard
                    name={item.name}
                    amount={formatCurrency(amount(item), currency)}
                    variant={`${kind}-${item.colorVariant === 'b' ? 'b' : 'a'}` satisfies ItemVariant}
                    icon={<Icon />}
                    owner={ownerName(item.ownerId)}
                    primary={item.isPrimary}
                    avatars={<HouseholdAvatars members={members} ownerId={item.ownerId} />}
                    progress={progress?.(item)}
                    caption={caption?.(item)}
                    onClick={() => setEditing(item)}
                  />
                </div>
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

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={text.createTitle}>
        {renderForm(null, () => setFormOpen(false), createContext)}
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={text.editTitle}>
        {editing && (
          <>
            {renderForm(editing, () => setEditing(null), null)}
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
