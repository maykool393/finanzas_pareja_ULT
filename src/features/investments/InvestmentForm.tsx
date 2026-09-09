import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ColorPicker } from '../../components/ui/ColorPicker'
import formStyles from '../../components/ui/form.module.css'
import { ACCOUNT_ICON_OPTIONS, type AccountIconKey } from '../../components/ui/icons'
import { IconPicker } from '../../components/ui/IconPicker'
import { MemberSelect } from '../../components/ui/MemberSelect'
import { NumberField } from '../../components/ui/NumberField'
import { TextField } from '../../components/ui/TextField'
import type { ColorVariant, Investment } from '../../types/domain'
import type { InvestmentInput } from './api'

const INVESTMENT_COLOR_OPTIONS = [
  { key: 'a', label: 'Morado', swatch: 'var(--investment-a-bg)' },
  { key: 'b', label: 'Verde', swatch: 'var(--investment-b-bg)' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface InvestmentFormProps {
  initial?: Investment
  onSubmit: (input: InvestmentInput) => Promise<void>
  onCancel: () => void
}

export function InvestmentForm({ initial, onSubmit, onCancel }: InvestmentFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [ownerId, setOwnerId] = useState<string | null>(initial?.ownerId ?? null)
  const [icon, setIcon] = useState<AccountIconKey>((initial?.icon as AccountIconKey) ?? 'trend-up')
  const [colorVariant, setColorVariant] = useState<ColorVariant>(initial?.colorVariant ?? 'a')
  const [invested, setInvested] = useState<number | null>(initial?.invested ?? null)
  const [currentValue, setCurrentValue] = useState<number | null>(initial?.currentValue ?? null)
  const [investedAt, setInvestedAt] = useState(initial?.investedAt ?? today())
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({
      name,
      ownerId,
      icon,
      colorVariant,
      invested: invested ?? 0,
      currentValue: currentValue ?? 0,
      investedAt,
    })
    setSubmitting(false)
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TextField label="Nombre" value={name} onChange={setName} required autoComplete="off" />

      <MemberSelect value={ownerId} onChange={setOwnerId} sharedLabel="Compartida" />

      <NumberField label="Monto invertido" value={invested} onChange={setInvested} required />
      <NumberField label="Valor actual" value={currentValue} onChange={setCurrentValue} required />

      <TextField label="Fecha de inversión" type="date" value={investedAt} onChange={setInvestedAt} required />

      <IconPicker value={icon} onChange={(v) => setIcon(v as AccountIconKey)} options={ACCOUNT_ICON_OPTIONS} />

      <ColorPicker
        value={colorVariant}
        onChange={(v) => setColorVariant(v as ColorVariant)}
        options={INVESTMENT_COLOR_OPTIONS}
      />

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </form>
  )
}
