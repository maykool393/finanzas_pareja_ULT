import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ColorPicker } from '../../components/ui/ColorPicker'
import formStyles from '../../components/ui/form.module.css'
import { ACCOUNT_ICON_OPTIONS, type AccountIconKey } from '../../components/ui/icons'
import { IconPicker } from '../../components/ui/IconPicker'
import { MemberSelect } from '../../components/ui/MemberSelect'
import { NumberField } from '../../components/ui/NumberField'
import { TextField } from '../../components/ui/TextField'
import type { ColorVariant, Debt } from '../../types/domain'
import type { DebtInput } from './api'

const DEBT_COLOR_OPTIONS = [
  { key: 'a', label: 'Coral', swatch: 'var(--debt-a-bg)' },
  { key: 'b', label: 'Rosa', swatch: 'var(--debt-b-bg)' },
]

interface DebtFormProps {
  initial?: Debt
  onSubmit: (input: DebtInput) => Promise<void>
  onCancel: () => void
}

export function DebtForm({ initial, onSubmit, onCancel }: DebtFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [ownerId, setOwnerId] = useState<string | null>(initial?.ownerId ?? null)
  const [icon, setIcon] = useState<AccountIconKey>((initial?.icon as AccountIconKey) ?? 'card')
  const [colorVariant, setColorVariant] = useState<ColorVariant>(initial?.colorVariant ?? 'a')
  const [principal, setPrincipal] = useState<number | null>(initial?.principal ?? null)
  const [remaining, setRemaining] = useState<number | null>(initial?.remaining ?? null)
  const [installmentAmount, setInstallmentAmount] = useState<number | null>(initial?.installmentAmount ?? null)
  const [installmentsRemaining, setInstallmentsRemaining] = useState<number | null>(
    initial?.installmentsRemaining ?? null,
  )
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({
      name,
      ownerId,
      icon,
      colorVariant,
      principal: principal ?? 0,
      remaining: remaining ?? 0,
      installmentAmount,
      installmentsRemaining,
    })
    setSubmitting(false)
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TextField label="Nombre" value={name} onChange={setName} required autoComplete="off" />

      <MemberSelect value={ownerId} onChange={setOwnerId} sharedLabel="Compartida" />

      <NumberField label="Monto total de la deuda" value={principal} onChange={setPrincipal} required />
      <NumberField label="Saldo actual" value={remaining} onChange={setRemaining} required />

      <NumberField
        label="Monto de la cuota"
        value={installmentAmount}
        onChange={setInstallmentAmount}
        hint="Opcional — déjalo vacío si no tiene cuotas fijas."
      />
      <NumberField
        label="Cuotas pendientes"
        value={installmentsRemaining}
        onChange={setInstallmentsRemaining}
        currency={false}
        min={0}
      />

      <IconPicker value={icon} onChange={(v) => setIcon(v as AccountIconKey)} options={ACCOUNT_ICON_OPTIONS} />

      <ColorPicker value={colorVariant} onChange={(v) => setColorVariant(v as ColorVariant)} options={DEBT_COLOR_OPTIONS} />

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </form>
  )
}
