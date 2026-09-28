import type { Profile } from '../../types/domain'
import { FinanceSection } from '../dashboard/FinanceSection'
import { InvestmentForm } from './InvestmentForm'
import { InvestmentList } from './InvestmentList'
import type { useInvestments } from './useInvestments'

interface InvestmentsSectionProps {
  /** De useInvestments() en Dashboard, que comparte los datos con el patrimonio y los gráficos. */
  query: ReturnType<typeof useInvestments>
  members: Profile[]
}

export function InvestmentsSection({ query, members }: InvestmentsSectionProps) {
  return (
    <FinanceSection
      kind="investment"
      title="Inversiones"
      query={{ ...query, items: query.investments }}
      members={members}
      defaultIcon="trend-up"
      amount={(investment) => investment.currentValue}
      renderActive={(investments, edit) => <InvestmentList items={investments} onSelect={edit} />}
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
        archiveDescription: (name) => `"${name}" dejará de aparecer en el dashboard. Puedes recuperarla cuando quieras.`,
        deleteDescription: (name) => `Esta acción no se puede deshacer. Se eliminará "${name}" de forma permanente.`,
      }}
      renderForm={(investment, close) => (
        <InvestmentForm
          initial={investment ?? undefined}
          onSubmit={async (input) => {
            if (investment) await query.update(investment.id, input)
            else await query.create(input)
            close()
          }}
          onCancel={close}
        />
      )}
    />
  )
}
