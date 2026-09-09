import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import formStyles from '../../components/ui/form.module.css'
import { MemberSelect } from '../../components/ui/MemberSelect'
import { NumberField } from '../../components/ui/NumberField'
import { Select } from '../../components/ui/Select'
import { TextField } from '../../components/ui/TextField'
import { TypeToggle } from '../../components/ui/TypeToggle'
import { useAccounts } from '../accounts/useAccounts'
import { useCategories } from '../categories/useCategories'
import type { Transaction } from '../../types/domain'
import type { TransactionInput } from './api'

type TxType = 'expense' | 'income'

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
] as const

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface TransactionFormProps {
  initial?: Transaction
  onSubmit: (input: TransactionInput) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({ initial, onSubmit, onCancel }: TransactionFormProps) {
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const activeAccounts = accounts.filter((a) => !a.archivedAt)

  const [type, setType] = useState<TxType>(initial ? (initial.amount >= 0 ? 'income' : 'expense') : 'expense')
  const [amount, setAmount] = useState<number | null>(initial ? Math.abs(initial.amount) : null)
  // null = no tocado todavía. useAccounts() carga async; si esto capturara
  // activeAccounts[0]?.id con useState quedaría pegado en '' para siempre
  // (mismo bug que tuvo BudgetForm) y Guardar nunca se habilitaría.
  const [accountId, setAccountId] = useState<string | null>(initial?.accountId ?? null)
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null)
  const [memberId, setMemberId] = useState<string | null>(initial?.memberId ?? null)
  const [occurredAt, setOccurredAt] = useState(initial?.occurredAt.slice(0, 10) ?? today())
  const [description, setDescription] = useState(initial?.description ?? '')
  const [submitting, setSubmitting] = useState(false)

  const effectiveAccountId = accountId ?? activeAccounts[0]?.id ?? ''
  const categoryOptions = categories.filter((c) => !c.archivedAt && c.type === type)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    const magnitude = amount ?? 0
    await onSubmit({
      accountId: effectiveAccountId,
      categoryId,
      memberId,
      amount: type === 'expense' ? -magnitude : magnitude,
      description: description.trim() === '' ? null : description.trim(),
      occurredAt,
    })
    setSubmitting(false)
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TypeToggle value={type} onChange={setType} options={TYPE_OPTIONS} />

      <NumberField label="Monto" value={amount} onChange={setAmount} required />

      <Select
        label="Cuenta"
        value={effectiveAccountId}
        onChange={setAccountId}
        options={activeAccounts.map((a) => ({ value: a.id, label: a.name }))}
        required
      />

      <Select
        label="Categoría"
        value={categoryId ?? ''}
        onChange={(v) => setCategoryId(v === '' ? null : v)}
        options={[
          { value: '', label: 'Sin categoría' },
          ...categoryOptions.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />

      <MemberSelect label="Titular" value={memberId} onChange={setMemberId} sharedLabel="Ambos" />

      <TextField label="Fecha" type="date" value={occurredAt} onChange={setOccurredAt} required />

      <TextField label="Nota" value={description} onChange={setDescription} placeholder="Opcional" />

      <Button type="submit" variant="primary" disabled={submitting || !effectiveAccountId}>
        {submitting ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </form>
  )
}
