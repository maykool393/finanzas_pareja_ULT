import { useCallback, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import type { Budget, BudgetProgress } from '../../types/domain'
import { listTransactions } from '../transactions/api'
import { type BudgetInput, createBudget, deleteBudget, listBudgets, updateBudgetAmount } from './api'

export function currentPeriodMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/** Último día del mes de `monthStart` ('YYYY-MM-01') — para acotar el rango de transacciones. */
function endOfMonth(monthStart: string): string {
  const date = new Date(`${monthStart}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + 1)
  date.setUTCDate(0)
  return date.toISOString().slice(0, 10)
}

export function useBudgets() {
  const { householdId } = useHouseholdId()
  const periodMonth = currentPeriodMonth()

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [budgetRows, transactions] = await Promise.all([
      listBudgets(periodMonth),
      listTransactions({ from: periodMonth, to: endOfMonth(periodMonth) }),
    ])
    setBudgets(budgetRows)
    // Suma el valor absoluto de toda transacción categorizada, sin filtrar por
    // signo: una categoría es siempre de un solo tipo (gasto o ingreso), así
    // que sus transacciones ya tienen el signo correcto por construcción —
    // esto cubre presupuestos de gasto (límite) e ingreso (meta) por igual.
    setSpentByCategory(
      transactions
        .filter((t) => t.categoryId)
        .reduce<Record<string, number>>((acc, t) => {
          const key = t.categoryId as string
          acc[key] = (acc[key] ?? 0) + Math.abs(t.amount)
          return acc
        }, {}),
    )
    setLoading(false)
  }, [periodMonth])

  useEffect(() => {
    refresh()
  }, [refresh])

  const progress: BudgetProgress[] = budgets.map((budget) => {
    const spent = spentByCategory[budget.categoryId] ?? 0
    return { ...budget, spent, ratio: budget.amount > 0 ? spent / budget.amount : 0 }
  })

  async function create(input: BudgetInput) {
    if (!householdId) return
    await createBudget(householdId, input)
    await refresh()
  }

  async function update(id: string, amount: number) {
    await updateBudgetAmount(id, amount)
    await refresh()
  }

  async function remove(id: string) {
    await deleteBudget(id)
    await refresh()
  }

  return { budgets: progress, loading, periodMonth, create, update, remove }
}
