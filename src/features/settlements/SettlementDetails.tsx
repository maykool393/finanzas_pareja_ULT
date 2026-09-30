import formStyles from '../../components/ui/form.module.css'
import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency, formatDate } from '../../lib/format'
import type { Account, Profile, Transaction } from '../../types/domain'

interface SettlementDetailsProps {
  /** Las mitades del saldo que están cargadas en la lista (una o las dos). */
  legs: Transaction[]
  accounts: Account[]
  members: Profile[]
}

/**
 * Qué dice un saldo, en una frase: se muestra al tocarlo en Movimientos. No se
 * edita: si algo está mal, se elimina y se vuelve a saldar desde el Resumen.
 */
export function SettlementDetails({ legs, accounts, members }: SettlementDetailsProps) {
  const currency = useCurrency()
  const out = legs.find((leg) => leg.amount < 0)
  const into = legs.find((leg) => leg.amount > 0)
  const nameOf = (id: string | null | undefined) => members.find((m) => m.id === id)?.displayName ?? 'Alguien'
  const accountOf = (leg: Transaction | undefined) => accounts.find((a) => a.id === leg?.accountId)?.name
  const any = out ?? into ?? legs[0]

  return (
    <div className={formStyles.form}>
      <p className={formStyles.notice}>
        {out && into
          ? `${nameOf(out.memberId)} le transfirió ${formatCurrency(-out.amount, currency)} a ${nameOf(into.memberId)} el ${formatDate(any.occurredAt)}, de ${accountOf(out)} a ${accountOf(into)}.`
          : `Transferencia de ${formatCurrency(Math.abs(any.amount), currency)} del ${formatDate(any.occurredAt)} (${accountOf(any) ?? 'cuenta'}).`}
      </p>
      <p className={formStyles.notice}>
        Salda los gastos compartidos del mes: no cuenta como gasto ni como ingreso. Si hay algo mal, elimínalo y vuelve a
        saldar desde el Resumen.
      </p>
    </div>
  )
}
