import type { Profile } from '../../types/domain'
import { FinanceSection } from '../patrimonio/FinanceSection'
import { AccountForm } from './AccountForm'
import type { useAccounts } from './useAccounts'

interface AccountsSectionProps {
  /** De useAccounts() en Patrimonio, que comparte los datos con el total y la composición. */
  query: ReturnType<typeof useAccounts>
  members: Profile[]
  /** El botón flotante de Patrimonio pide abrir el formulario de crear. */
  createRequest?: number
}

export function AccountsSection({ query, members, createRequest }: AccountsSectionProps) {
  return (
    <FinanceSection
      kind="account"
      title="Cuentas"
      query={{ ...query, items: query.accounts }}
      members={members}
      createRequest={createRequest}
      defaultIcon="bank"
      amount={(account) => account.balance}
      text={{
        add: 'Añadir cuenta',
        empty: {
          title: 'Aún no hay cuentas',
          description:
            'Agrega dónde está el dinero del hogar: banco, efectivo o tarjeta. Con sus saldos se calcula el patrimonio, y en ellas se registran los movimientos.',
          action: 'Agregar la primera cuenta',
        },
        archivedEmpty: 'Ninguna cuenta archivada.',
        createTitle: 'Nueva cuenta',
        editTitle: 'Editar cuenta',
        archiveTitle: 'Archivar cuenta',
        deleteTitle: 'Eliminar cuenta',
        archiveDescription: (name) =>
          `"${name}" dejará de aparecer en Patrimonio. Sus movimientos se conservan y puedes recuperarla cuando quieras.`,
        deleteDescription: (name) =>
          `Esta acción no se puede deshacer. Se eliminará "${name}" de forma permanente, junto con sus movimientos.`,
      }}
      renderForm={(account, close) =>
        account ? (
          <AccountForm
            initial={account}
            onSubmit={async (input) => {
              await query.update(account.id, input)
              close()
            }}
            onCancel={close}
          />
        ) : (
          <AccountForm
            onSubmit={async (input, initialBalance) => {
              await query.create(input, initialBalance)
              close()
            }}
            onCancel={close}
          />
        )
      }
    />
  )
}
