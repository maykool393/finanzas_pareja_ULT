import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ColorPicker } from '../../components/ui/ColorPicker'
import formStyles from '../../components/ui/form.module.css'
import { FormError } from '../../components/ui/FormError'
import { ACCOUNT_ICON_OPTIONS, type AccountIconKey } from '../../components/ui/iconRegistry'
import { IconPicker } from '../../components/ui/IconPicker'
import { MemberSelect } from '../../components/ui/MemberSelect'
import { NumberField } from '../../components/ui/NumberField'
import { Select } from '../../components/ui/Select'
import { TextField } from '../../components/ui/TextField'
import { useAsyncAction } from '../../hooks/useAsyncAction'
import { ERROR_MESSAGES, isUniqueViolation } from '../../lib/errorMessages'
import type { ColorVariant, Investment, InvestmentGroup } from '../../types/domain'
import type { InvestmentGroupInput, InvestmentInput } from './api'
import { GROUP_COLOR_OPTIONS } from './groupColors'

/** Valor del select que abre los campos para crear un grupo nuevo. */
const NEW_GROUP = '__nuevo'

function today() {
  return new Date().toISOString().slice(0, 10)
}

interface InvestmentFormProps {
  initial?: Investment
  groups: InvestmentGroup[]
  /** Grupo ya elegido al crear desde el botón + de un grupo. */
  defaultGroupId?: string | null
  onCreateGroup: (input: InvestmentGroupInput) => Promise<InvestmentGroup | null>
  onSubmit: (input: InvestmentInput) => Promise<void>
  onCancel: () => void
}

export function InvestmentForm({ initial, groups, defaultGroupId, onCreateGroup, onSubmit, onCancel }: InvestmentFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [ownerId, setOwnerId] = useState<string | null>(initial?.ownerId ?? null)
  const [icon, setIcon] = useState<AccountIconKey>((initial?.icon as AccountIconKey) ?? 'trend-up')
  const [groupId, setGroupId] = useState<string>(initial?.groupId ?? defaultGroupId ?? '')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupColor, setNewGroupColor] = useState<ColorVariant>('a')
  const [invested, setInvested] = useState<number | null>(initial?.invested ?? null)
  const [currentValue, setCurrentValue] = useState<number | null>(initial?.currentValue ?? null)
  const [investedAt, setInvestedAt] = useState(initial?.investedAt ?? today())
  const { pending: submitting, error, run } = useAsyncAction()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    run(async () => {
      // Un grupo nuevo se crea primero: la inversión necesita su id.
      let finalGroupId: string | null = groupId || null
      if (groupId === NEW_GROUP) {
        const group = await onCreateGroup({ name: newGroupName, icon: 'trend-up', colorVariant: newGroupColor })
        finalGroupId = group?.id ?? null
      }
      await onSubmit({
        name,
        ownerId,
        icon,
        // La variante de color ya no se elige: es del grupo. Se conserva la que tenía.
        colorVariant: initial?.colorVariant ?? 'a',
        invested: invested ?? 0,
        currentValue: currentValue ?? 0,
        investedAt,
        groupId: finalGroupId,
      })
    }, (err) =>
      // El nombre de grupo repetido es corregible: decirlo, no culpar a la conexión.
      isUniqueViolation(err) ? `Ya existe un grupo llamado "${newGroupName.trim()}". Elígelo en la lista.` : ERROR_MESSAGES.save,
    )
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TextField label="Nombre" value={name} onChange={setName} required autoComplete="off" />

      <MemberSelect value={ownerId} onChange={setOwnerId} sharedLabel="Compartida" />

      <NumberField label="Monto invertido" value={invested} onChange={setInvested} required />
      <NumberField label="Valor actual" value={currentValue} onChange={setCurrentValue} required />

      <TextField label="Fecha de inversión" type="date" value={investedAt} onChange={setInvestedAt} required />

      <IconPicker value={icon} onChange={(v) => setIcon(v as AccountIconKey)} options={ACCOUNT_ICON_OPTIONS} />

      <Select
        label="Grupo"
        value={groupId}
        onChange={setGroupId}
        options={[
          { value: '', label: 'Sin grupo (Otras)' },
          ...groups.map((group) => ({ value: group.id, label: group.name })),
          { value: NEW_GROUP, label: 'Nuevo grupo…' },
        ]}
      />

      {groupId === NEW_GROUP && (
        <>
          <TextField label="Nombre del grupo" value={newGroupName} onChange={setNewGroupName} required autoComplete="off" />
          <ColorPicker
            label="Color del grupo"
            value={newGroupColor}
            onChange={(v) => setNewGroupColor(v as ColorVariant)}
            options={GROUP_COLOR_OPTIONS}
          />
        </>
      )}

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
