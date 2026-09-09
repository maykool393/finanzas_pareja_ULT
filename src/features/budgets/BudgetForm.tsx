import { type FormEvent, useState } from 'react'
import { Button } from '../../components/ui/Button'
import formStyles from '../../components/ui/form.module.css'
import fieldStyles from '../../components/ui/formField.module.css'
import { NumberField } from '../../components/ui/NumberField'
import { Select } from '../../components/ui/Select'
import { TypeToggle } from '../../components/ui/TypeToggle'
import type { BudgetProgress, CategoryType } from '../../types/domain'
import { useCategories } from '../categories/useCategories'
import type { BudgetInput } from './api'

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
] as const

interface BudgetFormProps {
  initial?: BudgetProgress
  /** Categorías con presupuesto ya creado este mes — se excluyen al crear uno nuevo. */
  existingCategoryIds: string[]
  periodMonth: string
  onSubmit: (input: BudgetInput) => Promise<void>
  onCancel: () => void
}

export function BudgetForm({ initial, existingCategoryIds, periodMonth, onSubmit, onCancel }: BudgetFormProps) {
  const { categories } = useCategories()
  const initialCategory = categories.find((c) => c.id === initial?.categoryId)

  // null = el usuario no tocó el toggle todavía. Igual que con categoryId más
  // abajo: en modo edición, initialCategory depende de que useCategories()
  // ya haya cargado — si se capturara con useState al montar, quedaría
  // pegado en 'expense' si el diálogo abre antes de que lleguen los datos.
  // Al derivarlo en cada render se autocorrige apenas categories llega.
  const [typeChoice, setTypeChoice] = useState<CategoryType | null>(null)
  const type: CategoryType = typeChoice ?? initialCategory?.type ?? 'expense'

  const available = categories.filter(
    (c) => !c.archivedAt && c.type === type && (initial ? true : !existingCategoryIds.includes(c.id)),
  )

  // null = el usuario no ha tocado el selector todavía. `available` llega
  // vacío en el primer render (useCategories aún cargando) y se puebla
  // después — si acá se capturara un valor con useState en vez de derivarlo
  // en cada render, categoryId quedaría pegado en '' para siempre y el botón
  // Guardar nunca se habilitaría.
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null)
  const [amount, setAmount] = useState<number | null>(initial?.amount ?? null)
  const [submitting, setSubmitting] = useState(false)

  const effectiveCategoryId = categoryId ?? available[0]?.id ?? ''
  const amountLabel = type === 'income' ? 'Meta de ingreso' : 'Monto límite'

  function handleTypeChange(next: CategoryType) {
    setTypeChoice(next)
    setCategoryId(null) // la categoría elegida ya no es válida para el otro tipo
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit({ categoryId: effectiveCategoryId, periodMonth, amount: amount ?? 0 })
    setSubmitting(false)
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      {initial ? (
        <div className={fieldStyles.field}>
          <span className="label">{type === 'income' ? 'Ingreso' : 'Gasto'} · Categoría</span>
          <p>{initialCategory?.name}</p>
        </div>
      ) : (
        <>
          <TypeToggle value={type} onChange={handleTypeChange} options={TYPE_OPTIONS} />

          <Select
            label="Categoría"
            value={effectiveCategoryId}
            onChange={setCategoryId}
            options={available.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
        </>
      )}

      <NumberField label={amountLabel} value={amount} onChange={setAmount} required min={1} />

      <Button type="submit" variant="primary" disabled={submitting || !effectiveCategoryId}>
        {submitting ? 'Guardando…' : 'Guardar'}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </form>
  )
}
