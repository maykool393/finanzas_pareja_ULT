import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ColorPicker } from '../../components/ui/ColorPicker'
import { ACCOUNT_ICON_OPTIONS, type AccountIconKey } from '../../components/ui/icons'
import { IconPicker } from '../../components/ui/IconPicker'
import { MemberSelect } from '../../components/ui/MemberSelect'
import { NumberField } from '../../components/ui/NumberField'
import { Select } from '../../components/ui/Select'
import { TextField } from '../../components/ui/TextField'
import formStyles from '../../components/ui/form.module.css'
import type { Account, ColorVariant, AccountType } from '../../types/domain'
import type { AccountInput } from './api'

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Cuenta corriente' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de crédito' },
]

const ACCOUNT_COLOR_OPTIONS = [
  { key: 'a', label: 'Verde', swatch: 'var(--account-a-bg)' },
  { key: 'b', label: 'Morado', swatch: 'var(--account-b-bg)' },
]

interface AccountFormProps {
  initial?: Account
  onSubmit: (input: AccountInput, initialBalance: number) => Promise<void>
  onCancel: () => void
}

export function AccountForm({ initial, onSubmit, onCancel }: AccountFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<AccountType>(initial?.type ?? 'checking')
  const [ownerId, setOwnerId] = useState<string | null>(initial?.ownerId ?? null)
  const [icon, setIcon] = useState<AccountIconKey>((initial?.icon as AccountIconKey) ?? 'bank')
  const [colorVariant, setColorVariant] = useState<ColorVariant>(initial?.colorVariant ?? 'a')
  const [initialBalance, setInitialBalance] = useState<number | null>(initial?.initialBalance ?? 0)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({ name, type, ownerId, icon, colorVariant }, initialBalance ?? 0)
    setSubmitting(false)
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TextField label="Nombre" value={name} onChange={setName} required autoComplete="off" />

      <Select label="Tipo" value={type} onChange={(v) => setType(v as AccountType)} options={TYPE_OPTIONS} />

      <MemberSelect value={ownerId} onChange={setOwnerId} sharedLabel="Compartida" />

      {!initial && (
        <NumberField label="Saldo inicial" value={initialBalance} onChange={setInitialBalance} />
      )}

      <IconPicker value={icon} onChange={(v) => setIcon(v as AccountIconKey)} options={ACCOUNT_ICON_OPTIONS} />

      <ColorPicker value={colorVariant} onChange={(v) => setColorVariant(v as ColorVariant)} options={ACCOUNT_COLOR_OPTIONS} />

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </form>
  )
}
