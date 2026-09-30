import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ColorPicker } from '../../components/ui/ColorPicker'
import formStyles from '../../components/ui/form.module.css'
import { FormError } from '../../components/ui/FormError'
import { ACCOUNT_ICON_OPTIONS, type AccountIconKey } from '../../components/ui/iconRegistry'
import { IconPicker } from '../../components/ui/IconPicker'
import { TextField } from '../../components/ui/TextField'
import { useAsyncAction } from '../../hooks/useAsyncAction'
import { ERROR_MESSAGES, isUniqueViolation } from '../../lib/errorMessages'
import type { ColorVariant, InvestmentGroup } from '../../types/domain'
import type { InvestmentGroupInput } from './api'
import { GROUP_COLOR_OPTIONS } from './groupColors'

interface InvestmentGroupFormProps {
  initial: InvestmentGroup
  onSubmit: (input: InvestmentGroupInput) => Promise<void>
  onCancel: () => void
}

/** Editar un grupo de inversiones: nombre, ícono y color de su cuadro. */
export function InvestmentGroupForm({ initial, onSubmit, onCancel }: InvestmentGroupFormProps) {
  const [name, setName] = useState(initial.name)
  const [icon, setIcon] = useState<AccountIconKey>((initial.icon as AccountIconKey) ?? 'trend-up')
  const [colorVariant, setColorVariant] = useState<ColorVariant>(initial.colorVariant)
  const { pending: submitting, error, run } = useAsyncAction()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    run(
      () => onSubmit({ name, icon, colorVariant }),
      (err) => (isUniqueViolation(err) ? `Ya existe un grupo llamado "${name.trim()}".` : ERROR_MESSAGES.save),
    )
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TextField label="Nombre" value={name} onChange={setName} required autoComplete="off" />
      <IconPicker value={icon} onChange={(v) => setIcon(v as AccountIconKey)} options={ACCOUNT_ICON_OPTIONS} />
      <ColorPicker value={colorVariant} onChange={(v) => setColorVariant(v as ColorVariant)} options={GROUP_COLOR_OPTIONS} />

      {error && <FormError>{error}</FormError>}

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </form>
  )
}
