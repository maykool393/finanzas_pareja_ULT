import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency } from '../../lib/format'
import type { Debt, Profile } from '../../types/domain'
import { FinanceSection } from '../patrimonio/FinanceSection'
import { DebtForm } from './DebtForm'
import type { useDebts } from './useDebts'

interface DebtsSectionProps {
  /** De useDebts() en Patrimonio, que comparte los datos con el total y la composición. */
  query: ReturnType<typeof useDebts>
  members: Profile[]
  /** El botón flotante de Patrimonio pide abrir el formulario de crear. */
  createRequest?: number
}

export function DebtsSection({ query, members, createRequest }: DebtsSectionProps) {
  const currency = useCurrency()

  /** "$173.000 · 48 pagos": cuota y pagos que faltan, cuando la deuda los tiene. */
  function caption(debt: Debt) {
    const parts = [
      debt.installmentAmount !== null ? formatCurrency(debt.installmentAmount, currency) : null,
      debt.installmentsRemaining !== null
        ? `${debt.installmentsRemaining} ${debt.installmentsRemaining === 1 ? 'pago' : 'pagos'}`
        : null,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(' · ') : null
  }

  return (
    <FinanceSection
      kind="debt"
      title="Deudas"
      query={{ ...query, items: query.debts }}
      members={members}
      createRequest={createRequest}
      defaultIcon="card"
      amount={(debt) => debt.remaining}
      progress={(debt) => (debt.principal > 0 ? (debt.principal - debt.remaining) / debt.principal : 0)}
      caption={caption}
      text={{
        add: 'Añadir deuda',
        empty: {
          title: 'Sin deudas registradas',
          description: 'Si hay un préstamo o una compra en cuotas, agrégalo para ver cuánto falta por pagar. Se resta del patrimonio.',
          action: 'Agregar una deuda',
        },
        archivedEmpty: 'Ninguna deuda archivada.',
        createTitle: 'Nueva deuda',
        editTitle: 'Editar deuda',
        archiveTitle: 'Archivar deuda',
        deleteTitle: 'Eliminar deuda',
        archiveDescription: (name) => `"${name}" dejará de aparecer en Patrimonio. Puedes recuperarla cuando quieras.`,
        deleteDescription: (name) => `Esta acción no se puede deshacer. Se eliminará "${name}" de forma permanente.`,
      }}
      renderForm={(debt, close) => (
        <DebtForm
          initial={debt ?? undefined}
          onSubmit={async (input) => {
            if (debt) await query.update(debt.id, input)
            else await query.create(input)
            close()
          }}
          onCancel={close}
        />
      )}
    />
  )
}
