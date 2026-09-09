import { useHouseholdMembers } from '../../hooks/useHouseholdMembers'
import { Select } from './Select'

interface MemberSelectProps {
  label?: string
  /** id de profile; null = compartido/ambos */
  value: string | null
  onChange: (value: string | null) => void
  /** Texto de la opción "sin titular individual" — varía según el contexto. */
  sharedLabel?: string
}

/**
 * Selector de titular: "Compartida"/"Ambos" + cada miembro del household.
 * Es el mismo dato (ownerId en cuentas/deudas/inversiones, memberId en
 * transacciones) así que vive como un único primitivo — no una copia por módulo.
 */
export function MemberSelect({ label = 'Titular', value, onChange, sharedLabel = 'Compartida' }: MemberSelectProps) {
  const { members } = useHouseholdMembers()

  return (
    <Select
      label={label}
      value={value ?? ''}
      onChange={(next) => onChange(next === '' ? null : next)}
      options={[
        { value: '', label: sharedLabel },
        ...members.map((member) => ({ value: member.id, label: member.displayName })),
      ]}
    />
  )
}
