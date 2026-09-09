export type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card'
/** Rota entre variantes para diferenciar filas del mismo tipo — ver ItemCard. Compartido por Cuentas y Deudas. */
export type ColorVariant = 'a' | 'b'

export interface Account {
  id: string
  householdId: string
  ownerId: string | null // null = cuenta compartida
  name: string
  type: AccountType
  initialBalance: number
  balance: number // mantenido por trigger desde Fase 5 — nunca se edita a mano tras crear
  icon: string
  colorVariant: ColorVariant
  currency: string
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Debt {
  id: string
  householdId: string
  ownerId: string | null
  name: string
  principal: number
  remaining: number
  interestRate: number | null
  dueDate: string | null
  icon: string
  colorVariant: ColorVariant
  /** Ambos opcionales: no toda deuda tiene cuotas fijas (ej. tarjeta revolvente). */
  installmentAmount: number | null
  installmentsRemaining: number | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Investment {
  id: string
  householdId: string
  ownerId: string | null
  name: string
  invested: number
  currentValue: number
  investedAt: string
  icon: string
  colorVariant: ColorVariant
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  householdId: string
  accountId: string
  categoryId: string | null
  memberId: string | null // titular; null = ambos
  createdBy: string // quién lo registró en la app — distinto de memberId, ver README
  amount: number // negativo = gasto, positivo = ingreso
  description: string | null
  occurredAt: string
  createdAt: string
  updatedAt: string
}

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  memberId?: string
  from?: string
  to?: string
}

export interface Profile {
  id: string
  householdId: string | null
  displayName: string
  avatarUrl: string | null
}

export type CategoryType = 'expense' | 'income'
/** Familias de tono ya definidas en tokens.css — nunca color libre. */
export type CategoryColor = 'green' | 'purple' | 'coral' | 'pink'

export interface Category {
  id: string
  householdId: string
  name: string
  type: CategoryType
  icon: string
  color: CategoryColor
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  householdId: string
  categoryId: string
  periodMonth: string // 'YYYY-MM-01'
  amount: number
  createdAt: string
  updatedAt: string
}

export interface BudgetProgress extends Budget {
  spent: number
  ratio: number
}
