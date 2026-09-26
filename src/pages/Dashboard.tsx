import { lazy, Suspense } from 'react'
import { Card } from '../components/ui/Card'
import { AccountsSection } from '../features/accounts/AccountsSection'
import { useAccounts } from '../features/accounts/useAccounts'
import { useCategories } from '../features/categories/useCategories'
import { useDashboardCharts } from '../features/dashboard/useDashboardCharts'
import { DebtsSection } from '../features/debts/DebtsSection'
import { useDebts } from '../features/debts/useDebts'
import { InvestmentsSection } from '../features/investments/InvestmentsSection'
import { useInvestments } from '../features/investments/useInvestments'
import { TransactionList } from '../features/transactions/TransactionList'
import { useTransactions } from '../features/transactions/useTransactions'
import { useCurrency } from '../hooks/useCurrency'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import { formatCurrency, formatMonth } from '../lib/format'
import styles from './Dashboard.module.css'

// Los gráficos (recharts) son la mayor parte del JS de la app y solo se usan
// aquí: se cargan aparte, después del resto del dashboard.
const CategoryBreakdownChart = lazy(() =>
  import('../features/dashboard/CategoryBreakdownChart').then((m) => ({ default: m.CategoryBreakdownChart })),
)
const IncomeVsExpenseChart = lazy(() =>
  import('../features/dashboard/IncomeVsExpenseChart').then((m) => ({ default: m.IncomeVsExpenseChart })),
)
const NetWorthTrendChart = lazy(() =>
  import('../features/dashboard/NetWorthTrendChart').then((m) => ({ default: m.NetWorthTrendChart })),
)

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)

export function Dashboard() {
  const currency = useCurrency()
  const { accounts } = useAccounts()
  const { debts } = useDebts()
  const { investments } = useInvestments()
  const { categories } = useCategories()
  const { members } = useHouseholdMembers()
  const { transactions } = useTransactions()
  const recentTransactions = transactions.slice(0, 5)
  const { loading: chartsLoading, categoryBreakdown, incomeVsExpense, netWorthTrend } = useDashboardCharts(
    accounts,
    debts,
    investments,
    categories,
  )

  const accountsTotal = sum(accounts.filter((a) => !a.archivedAt).map((a) => a.balance))
  const debtsTotal = sum(debts.filter((d) => !d.archivedAt).map((d) => d.remaining))
  const investmentsTotal = sum(investments.filter((i) => !i.archivedAt).map((i) => i.currentValue))
  const netWorth = accountsTotal + investmentsTotal - debtsTotal

  return (
    <>
      <header className={styles.hero}>
        <p className="label">Patrimonio neto · {formatMonth(new Date())}</p>
        <p className={`amount ${styles.heroTotal}`}>{formatCurrency(netWorth, currency)}</p>
        <p className={styles.heroMeta}>Actualizado hoy</p>
      </header>

      <AccountsSection />
      <DebtsSection />
      <InvestmentsSection />

      {!chartsLoading && (
        <>
          <Card title="Gastos por categoría" className={styles.wide}>
            <Suspense fallback={<div className={styles.chartPlaceholder} aria-busy="true" />}>
              <CategoryBreakdownChart items={categoryBreakdown} />
            </Suspense>
          </Card>

          <Card title="Ingresos vs. gastos" className={styles.wide}>
            <Suspense fallback={<div className={styles.chartPlaceholder} aria-busy="true" />}>
              <IncomeVsExpenseChart data={incomeVsExpense} />
            </Suspense>
          </Card>

          <Card title="Evolución del patrimonio" className={styles.wide}>
            <Suspense fallback={<div className={styles.chartPlaceholder} aria-busy="true" />}>
              <NetWorthTrendChart data={netWorthTrend} />
            </Suspense>
          </Card>
        </>
      )}

      <Card title="Últimos movimientos" className={styles.wide}>
        <TransactionList
          transactions={recentTransactions}
          accounts={accounts}
          categories={categories}
          members={members}
        />
      </Card>
    </>
  )
}
