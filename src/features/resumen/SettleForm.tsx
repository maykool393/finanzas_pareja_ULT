import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import formStyles from '../../components/ui/form.module.css'
import { FormError } from '../../components/ui/FormError'
import { NumberField } from '../../components/ui/NumberField'
import { Select } from '../../components/ui/Select'
import { TextField } from '../../components/ui/TextField'
import { useAsyncAction } from '../../hooks/useAsyncAction'
import { ERROR_MESSAGES } from '../../lib/errorMessages'
import type { Account, Profile } from '../../types/domain'
import type { SettlementInput } from '../settlements/api'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const firstName = (member: Profile) => member.displayName.trim().split(/\s+/)[0] || member.displayName

/** Las cuentas propias de una persona, sin archivar, con la principal primero. */
function accountsOf(accounts: Account[], member: Profile) {
  return accounts
    .filter((a) => a.ownerId === member.id && !a.archivedAt)
    .sort((x, y) => Number(y.isPrimary) - Number(x.isPrimary))
}

interface SettleFormProps {
  debt: { from: Profile; to: Profile; amount: number }
  periodMonth: string
  accounts: Account[]
  onSubmit: (input: SettlementInput) => Promise<void>
  onCancel: () => void
}

/**
 * "Saldar" (DESIGN.md § Resumen, historia 2): anota la transferencia de quien
 * debe a quien pagó de más. El dinero se mueve en el banco; la app registra
 * la salida y la entrada para que los saldos de las cuentas sigan correctos.
 */
export function SettleForm({ debt, periodMonth, accounts, onSubmit, onCancel }: SettleFormProps) {
  const fromAccounts = accountsOf(accounts, debt.from)
  const toAccounts = accountsOf(accounts, debt.to)

  const [amount, setAmount] = useState<number | null>(debt.amount)
  // null = no tocado: la primera cuenta de la lista (la principal, si es suya).
  const [fromId, setFromId] = useState<string | null>(null)
  const [toId, setToId] = useState<string | null>(null)
  const [occurredAt, setOccurredAt] = useState(today)
  const { pending, error, run } = useAsyncAction()

  const effectiveFromId = fromId ?? fromAccounts[0]?.id ?? ''
  const effectiveToId = toId ?? toAccounts[0]?.id ?? ''
  const missing = [fromAccounts.length === 0 && debt.from, toAccounts.length === 0 && debt.to].filter(
    (member): member is Profile => Boolean(member),
  )
  const canSubmit = missing.length === 0 && (amount ?? 0) > 0 && !pending

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit || amount === null) return
    run(
      () =>
        onSubmit({
          periodMonth,
          fromAccountId: effectiveFromId,
          toAccountId: effectiveToId,
          amount,
          occurredAt,
        }),
      ERROR_MESSAGES.save,
    )
  }

  const from = firstName(debt.from)
  const to = firstName(debt.to)

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <p className={formStyles.notice}>
        Anota la transferencia que {from} le hizo a {to}. El dinero se mueve en el banco: aquí queda registrado y el
        saldo de las dos cuentas se ajusta. No cuenta como gasto ni como ingreso.
      </p>

      <NumberField label="Monto" value={amount} onChange={setAmount} required />

      {missing.length === 0 ? (
        <>
          <Select
            label={`Desde la cuenta de ${from}`}
            value={effectiveFromId}
            onChange={setFromId}
            options={fromAccounts.map((a) => ({ value: a.id, label: a.name }))}
            required
          />
          <Select
            label={`Hacia la cuenta de ${to}`}
            value={effectiveToId}
            onChange={setToId}
            options={toAccounts.map((a) => ({ value: a.id, label: a.name }))}
            required
          />
        </>
      ) : (
        // Sin esto, Saldar quedaba desactivado sin decir por qué.
        <p className={formStyles.notice}>
          {missing.map(firstName).join(' y ')} {missing.length === 1 ? 'no tiene' : 'no tienen'} una cuenta propia: la
          transferencia sale de la cuenta de quien debe y entra en la de quien cobra. Crea la cuenta en{' '}
          <Link to="/patrimonio">Patrimonio</Link> y vuelve aquí.
        </p>
      )}

      <TextField label="Fecha" type="date" value={occurredAt} onChange={setOccurredAt} required />

      {error && <FormError>{error}</FormError>}

      <Button type="submit" variant="primary" disabled={!canSubmit}>
        {pending ? 'Guardando…' : 'Saldar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
        Cancelar
      </Button>
    </form>
  )
}
