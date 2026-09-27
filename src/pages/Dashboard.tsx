import { lazy, Suspense } from 'react'
import { Card } from '../components/ui/Card'
import { LoadError, LoadStatus } from '../components/ui/LoadStatus'
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
import { useDocumentTitle } from '../hooks/useDocumentTitle'
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
  useDocumentTitle('Finanzas')
  const currency = useCurrency()
  const accountsQuery = useAccounts()
  const debtsQuery = useDebts()
  const investmentsQuery = useInvestments()
  const { accounts } = accountsQuery
  const { debts } = debtsQuery
  const { investments } = investmentsQuery
  const { categories } = useCategories()
  const { members } = useHouseholdMembers()
  const transactionsQuery = useTransactions()
  const recentTransactions = transactionsQuery.transactions.slice(0, 5)
  const charts = useDashboardCharts(accounts, debts, investments, categories)

  const accountsTotal = sum(accounts.filter((a) => !a.archivedAt).map((a) => a.balance))
  const debtsTotal = sum(debts.filter((d) => !d.archivedAt).map((d) => d.remaining))
  const investmentsTotal = sum(investments.filter((i) => !i.archivedAt).map((i) => i.currentValue))
  const netWorth = accountsTotal + investmentsTotal - debtsTotal

  // El patrimonio suma tres listas: si falta una, el total sería falso.
  const totalsLoading = accountsQuery.loading || debtsQuery.loading || investmentsQuery.loading
  const totalsError = accountsQuery.error || debtsQuery.error || investmentsQuery.error

  return (
    <>
      <header className={styles.hero}>
        {/* Las demás pantallas muestran su título; aquí el encabezado visible es el
            patrimonio, así que el título de la pestaña queda solo para lectores de pantalla. */}
        <h1 className="visually-hidden">Finanzas</h1>
        <p className="label">Patrimonio neto · {formatMonth(new Date())}</p>
        {totalsError ? (
          <p className={styles.heroError}>No se pudo calcular: faltan datos por cargar.</p>
        ) : totalsLoading ? (
          <p className={`amount ${styles.heroTotal}`} aria-busy="true">
            <span className={styles.heroSkeleton} />
          </p>
        ) : (
          <p className={`amount ${styles.heroTotal}`}>{formatCurrency(netWorth, currency)}</p>
        )}
        <p className={styles.heroMeta}>Cuentas e inversiones, menos deudas</p>
      </header>

      {/* Las secciones reciben los mismos datos que el patrimonio y los gráficos:
          si cada una los cargara por su cuenta, guardar en una no actualizaría el total. */}
      <AccountsSection query={accountsQuery} members={members} />
      <DebtsSection query={debtsQuery} members={members} />
      <InvestmentsSection query={investmentsQuery} members={members} />

      {charts.error && (
        <Card title="Gráficos" className={styles.wide}>
          <LoadError onRetry={charts.retry} />
        </Card>
      )}

      {!charts.loading && !charts.error && (
        <>
          <Card title="Gastos por categoría" className={styles.wide}>
            <Suspense fallback={<div className={styles.chartPlaceholder} aria-busy="true" />}>
              <CategoryBreakdownChart items={charts.categoryBreakdown} />
            </Suspense>
          </Card>

          <Card title="Ingresos vs. gastos" className={styles.wide}>
            <Suspense fallback={<div className={styles.chartPlaceholder} aria-busy="true" />}>
              <IncomeVsExpenseChart data={charts.incomeVsExpense} />
            </Suspense>
          </Card>

          <Card title="Evolución del patrimonio" className={styles.wide}>
            <Suspense fallback={<div className={styles.chartPlaceholder} aria-busy="true" />}>
              <NetWorthTrendChart data={charts.netWorthTrend} />
            </Suspense>
          </Card>
        </>
      )}

      <Card title="Últimos movimientos" className={styles.wide}>
        <LoadStatus
          loading={transactionsQuery.loading}
          error={transactionsQuery.error}
          onRetry={transactionsQuery.retry}
        >
          <TransactionList
            transactions={recentTransactions}
            accounts={accounts}
            categories={categories}
            members={members}
          />
        </LoadStatus>
      </Card>
    </>
  )
}
