import { Select } from '../../components/ui/Select'
import { TextField } from '../../components/ui/TextField'
import type { Account, Category, Profile, TransactionFilters } from '../../types/domain'
import styles from './TransactionFiltersBar.module.css'

interface TransactionFiltersBarProps {
  filters: TransactionFilters
  onChange: (filters: TransactionFilters) => void
  accounts: Account[]
  categories: Category[]
  members: Profile[]
}

export function TransactionFiltersBar({
  filters,
  onChange,
  accounts,
  categories,
  members,
}: TransactionFiltersBarProps) {
  return (
    <div className={styles.filters}>
      <Select
        label="Cuenta"
        value={filters.accountId ?? ''}
        onChange={(v) => onChange({ ...filters, accountId: v || undefined })}
        options={[{ value: '', label: 'Todas' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
      />
      <Select
        label="Categoría"
        value={filters.categoryId ?? ''}
        onChange={(v) => onChange({ ...filters, categoryId: v || undefined })}
        options={[{ value: '', label: 'Todas' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
      />
      <Select
        label="Titular"
        value={filters.memberId ?? ''}
        onChange={(v) => onChange({ ...filters, memberId: v || undefined })}
        options={[{ value: '', label: 'Todos' }, ...members.map((m) => ({ value: m.id, label: m.displayName }))]}
      />
      <TextField
        label="Desde"
        type="date"
        value={filters.from ?? ''}
        onChange={(v) => onChange({ ...filters, from: v || undefined })}
      />
      <TextField
        label="Hasta"
        type="date"
        value={filters.to ?? ''}
        onChange={(v) => onChange({ ...filters, to: v || undefined })}
      />
    </div>
  )
}
