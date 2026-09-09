import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ColorPicker } from '../../components/ui/ColorPicker'
import formStyles from '../../components/ui/form.module.css'
import { CATEGORY_ICON_OPTIONS, type CategoryIconKey } from '../../components/ui/icons'
import { IconPicker } from '../../components/ui/IconPicker'
import { TextField } from '../../components/ui/TextField'
import { TypeToggle } from '../../components/ui/TypeToggle'
import type { Category, CategoryColor, CategoryType } from '../../types/domain'
import type { CategoryInput } from './api'
import { CATEGORY_COLOR_OPTIONS } from './colors'

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
] as const

interface CategoryFormProps {
  initial?: Category
  onSubmit: (input: CategoryInput) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<CategoryType>(initial?.type ?? 'expense')
  const [icon, setIcon] = useState<CategoryIconKey>((initial?.icon as CategoryIconKey) ?? 'other')
  const [color, setColor] = useState<CategoryColor>(initial?.color ?? 'green')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({ name, type, icon, color })
    setSubmitting(false)
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <TypeToggle value={type} onChange={setType} options={TYPE_OPTIONS} />

      <TextField label="Nombre" value={name} onChange={setName} required autoComplete="off" />

      <IconPicker
        value={icon}
        onChange={(v) => setIcon(v as CategoryIconKey)}
        options={CATEGORY_ICON_OPTIONS}
      />

      <ColorPicker value={color} onChange={(v) => setColor(v as CategoryColor)} options={CATEGORY_COLOR_OPTIONS} />

      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </form>
  )
}
