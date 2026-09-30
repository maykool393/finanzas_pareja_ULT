import { useState } from 'react'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { DangerRow } from '../../components/ui/DangerRow'
import { Dialog } from '../../components/ui/Dialog'
import type { InvestmentGroup, Profile } from '../../types/domain'
import { FinanceSection } from '../patrimonio/FinanceSection'
import { InvestmentForm } from './InvestmentForm'
import { InvestmentGroupForm } from './InvestmentGroupForm'
import { InvestmentList } from './InvestmentList'
import { useInvestmentGroups } from './useInvestmentGroups'
import type { useInvestments } from './useInvestments'

interface InvestmentsSectionProps {
  /** De useInvestments() en Patrimonio, que comparte los datos con el total y la composición. */
  query: ReturnType<typeof useInvestments>
  members: Profile[]
  /** El botón flotante de Patrimonio pide abrir "Nueva inversión". */
  createRequest?: number
}

export function InvestmentsSection({ query, members, createRequest }: InvestmentsSectionProps) {
  const groups = useInvestmentGroups()
  const [editingGroup, setEditingGroup] = useState<InvestmentGroup | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<InvestmentGroup | null>(null)

  return (
    <>
      <FinanceSection
        kind="investment"
        title="Inversiones"
        query={{ ...query, items: query.investments }}
        members={members}
        defaultIcon="trend-up"
        amount={(investment) => investment.currentValue}
        createRequest={createRequest}
        renderActive={(investments, edit, create) => (
          <InvestmentList
            items={investments}
            groups={groups.groups}
            onSelect={edit}
            onAddToGroup={(groupId) => create(groupId)}
            onEditGroup={setEditingGroup}
          />
        )}
        text={{
          add: 'Añadir inversión',
          empty: {
            title: 'Aún no hay inversiones',
            description: 'Agrega depósitos a plazo, fondos o acciones con su valor actual. Se suman al patrimonio.',
            action: 'Agregar una inversión',
          },
          archivedEmpty: 'Ninguna inversión archivada.',
          createTitle: 'Nueva inversión',
          editTitle: 'Editar inversión',
          archiveTitle: 'Archivar inversión',
          deleteTitle: 'Eliminar inversión',
          archiveDescription: (name) => `"${name}" dejará de aparecer en Patrimonio. Puedes recuperarla cuando quieras.`,
          deleteDescription: (name) => `Esta acción no se puede deshacer. Se eliminará "${name}" de forma permanente.`,
        }}
        renderForm={(investment, close, groupId) => (
          <InvestmentForm
            initial={investment ?? undefined}
            groups={groups.groups}
            defaultGroupId={groupId}
            onCreateGroup={groups.create}
            onSubmit={async (input) => {
              if (investment) await query.update(investment.id, input)
              else await query.create(input)
              close()
            }}
            onCancel={close}
          />
        )}
      />

      <Dialog open={editingGroup !== null} onClose={() => setEditingGroup(null)} title="Editar grupo">
        {editingGroup && (
          <>
            <InvestmentGroupForm
              initial={editingGroup}
              onSubmit={async (input) => {
                await groups.update(editingGroup.id, input)
                setEditingGroup(null)
              }}
              onCancel={() => setEditingGroup(null)}
            />
            <DangerRow>
              <button
                type="button"
                onClick={() => {
                  setDeletingGroup(editingGroup)
                  setEditingGroup(null)
                }}
              >
                Eliminar grupo
              </button>
            </DangerRow>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={deletingGroup !== null}
        onClose={() => setDeletingGroup(null)}
        onConfirm={async () => {
          if (!deletingGroup) return
          await groups.remove(deletingGroup.id)
          setDeletingGroup(null)
        }}
        title="Eliminar grupo"
        description={`Se eliminará el grupo "${deletingGroup?.name ?? ''}". Sus inversiones no se borran: pasan a "Otras".`}
        tone="delete"
      />
    </>
  )
}
