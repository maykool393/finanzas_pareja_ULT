import { useEffect, useState } from 'react'
import type { Account, Category, Debt, Investment, Transaction } from '../../types/domain'
import { CATEGORY_COLOR_TOKENS } from '../categories/colors'
import { listTransactions } from '../transactions/api'

const TREND_DAYS = 90
const MONTHS_BACK = 5 // + el mes actual = 6 meses en el gráfico de ingresos/gastos

const MONTH_LABEL = new Intl.DateTimeFormat('es-CL', { month: 'short' })

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Día 1 del mes, `monthsBack` meses atrás (0 = mes actual). */
function monthStart(monthsBack: number): Date {
  const date = new Date()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() - monthsBack)
  return date
}

export interface CategoryBreakdownItem {
  categoryId: string
  name: string
  amount: number
  bg: string
  text: string
}

export interface MonthlyTotals {
  month: string
  label: string
  income: number
  expense: number
}

export interface NetWorthPoint {
  date: string
  netWorth: number
}

/**
 * Alimenta los 3 gráficos del dashboard con una sola consulta acotada a los
 * últimos 6 meses (no todo el historial). Deudas e inversiones se proyectan
 * con su valor ACTUAL de forma constante en la evolución del patrimonio —
 * no tienen historial propio (se editan directo, no vía transacciones), a
 * diferencia de las cuentas, cuya curva sí es exacta día a día. Ver README.
 */
export function useDashboardCharts(
  accounts: Account[],
  debts: Debt[],
  investments: Investment[],
  categories: Category[],
) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    listTransactions({ from: isoDate(monthStart(MONTHS_BACK)) }).then((data) => {
      if (!active) return
      setTransactions(data)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const currentAccountsTotal = accounts.filter((a) => !a.archivedAt).reduce((sum, a) => sum + a.balance, 0)
  const currentInvestmentsTotal = investments
    .filter((i) => !i.archivedAt)
    .reduce((sum, i) => sum + i.currentValue, 0)
  const currentDebtsTotal = debts.filter((d) => !d.archivedAt).reduce((sum, d) => sum + d.remaining, 0)

  // ---------- a) Gastos por categoría (mes actual) ----------
  const currentMonthKey = isoDate(monthStart(0))
  const spentByCategory = transactions
    .filter((t) => t.amount < 0 && t.categoryId && t.occurredAt.slice(0, 10) >= currentMonthKey)
    .reduce<Record<string, number>>((acc, t) => {
      const key = t.categoryId as string
      acc[key] = (acc[key] ?? 0) + Math.abs(t.amount)
      return acc
    }, {})

  const categoryBreakdown: CategoryBreakdownItem[] = Object.entries(spentByCategory)
    .map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId)
      const tone = category ? CATEGORY_COLOR_TOKENS[category.color] : null
      return {
        categoryId,
        name: category?.name ?? 'Sin categoría',
        amount,
        bg: tone?.bg ?? 'var(--surface-sunken)',
        text: tone?.text ?? 'var(--text-primary)',
      }
    })
    .sort((a, b) => b.amount - a.amount)

  // ---------- b) Ingresos vs. gastos, últimos 6 meses ----------
  const monthly = new Map<string, MonthlyTotals>()
  for (let i = MONTHS_BACK; i >= 0; i--) {
    const date = monthStart(i)
    const key = isoDate(date).slice(0, 7)
    monthly.set(key, { month: key, label: MONTH_LABEL.format(date), income: 0, expense: 0 })
  }
  for (const t of transactions) {
    const entry = monthly.get(t.occurredAt.slice(0, 7))
    if (!entry) continue
    if (t.amount >= 0) entry.income += t.amount
    else entry.expense += Math.abs(t.amount)
  }
  const incomeVsExpense = [...monthly.values()]

  // ---------- c) Evolución del patrimonio (últimos 90 días) ----------
  const trendStart = new Date()
  trendStart.setUTCDate(trendStart.getUTCDate() - TREND_DAYS)
  const trendStartKey = isoDate(trendStart)

  const inTrend = transactions.filter((t) => t.occurredAt.slice(0, 10) >= trendStartKey)
  const sumInTrend = inTrend.reduce((sum, t) => sum + t.amount, 0)
  // Saldo de cuentas al inicio de la ventana: el actual menos lo que se movió dentro de ella.
  const baseline = currentAccountsTotal - sumInTrend

  const deltaByDay = new Map<string, number>()
  for (const t of inTrend) {
    const day = t.occurredAt.slice(0, 10)
    deltaByDay.set(day, (deltaByDay.get(day) ?? 0) + t.amount)
  }

  const netWorthTrend: NetWorthPoint[] = []
  let cumulative = baseline
  for (let i = 0; i <= TREND_DAYS; i++) {
    const day = new Date(trendStart)
    day.setUTCDate(day.getUTCDate() + i)
    const key = isoDate(day)
    cumulative += deltaByDay.get(key) ?? 0
    netWorthTrend.push({ date: key, netWorth: cumulative + currentInvestmentsTotal - currentDebtsTotal })
  }

  return { loading, categoryBreakdown, incomeVsExpense, netWorthTrend }
}
