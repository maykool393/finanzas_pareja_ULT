import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { PiggyIcon } from '../components/ui/icons'
import { ItemCard } from '../components/ui/ItemCard'
import { SectionHeader } from '../components/ui/SectionHeader'
import { AccountsSection } from '../features/accounts/AccountsSection'
import { useAccounts } from '../features/accounts/useAccounts'
import { useCategories } from '../features/categories/useCategories'
import { CategoryBreakdownChart } from '../features/dashboard/CategoryBreakdownChart'
import { IncomeVsExpenseChart } from '../features/dashboard/IncomeVsExpenseChart'
import { NetWorthTrendChart } from '../features/dashboard/NetWorthTrendChart'
import { useDashboardCharts } from '../features/dashboard/useDashboardCharts'
import { DebtsSection } from '../features/debts/DebtsSection'
import { useDebts } from '../features/debts/useDebts'
import { InvestmentsSection } from '../features/investments/InvestmentsSection'
import { useInvestments } from '../features/investments/useInvestments'
import { TransactionList } from '../features/transactions/TransactionList'
import { useTransactions } from '../features/transactions/useTransactions'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import { formatCurrency, formatMonth } from '../lib/format'
import styles from './Dashboard.module.css'

interface MockItem {
  id: string
  name: string
  value: number
  owner: string | null
}

// TODO: reemplazar por datos de Supabase (src/features/*) cuando exista un módulo de metas de ahorro.
const MOCK = {
  savings: [{ id: 's1', name: 'Meta: viaje', value: 900_000, owner: null }] satisfies MockItem[],
}

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0)

type SectionKey = 'savings'

export function Dashboard() {
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

  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    savings: true,
  })

  const toggle = (key: SectionKey) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  const accountsTotal = sum(accounts.filter((a) => !a.archivedAt).map((a) => a.balance))
  const debtsTotal = sum(debts.filter((d) => !d.archivedAt).map((d) => d.remaining))
  const investmentsTotal = sum(investments.filter((i) => !i.archivedAt).map((i) => i.currentValue))
  const netWorth = accountsTotal + investmentsTotal + sum(MOCK.savings.map((s) => s.value)) - debtsTotal

  return (
    <>
      <header className={styles.hero}>
        <p className="label">Patrimonio neto · {formatMonth(new Date())}</p>
        <p className={`amount ${styles.heroTotal}`}>{formatCurrency(netWorth)}</p>
        <p className={styles.heroMeta}>Actualizado hoy</p>
      </header>

      <AccountsSection />
      <DebtsSection />
      <InvestmentsSection />

      <section className={styles.section}>
        <SectionHeader
          title="Ahorro"
          total={formatCurrency(sum(MOCK.savings.map((s) => s.value)))}
          expanded={expanded.savings}
          onToggle={() => toggle('savings')}
        />
        {expanded.savings && (
          <div className={styles.cardRow}>
            {MOCK.savings.map((goal) => (
              <ItemCard
                key={goal.id}
                name={goal.name}
                amount={formatCurrency(goal.value)}
                variant="investment-a"
                icon={<PiggyIcon />}
                owner={goal.owner}
              />
            ))}
          </div>
        )}
      </section>

      {!chartsLoading && (
        <>
          <Card title="Gastos por categoría" className={styles.wide}>
            <CategoryBreakdownChart items={categoryBreakdown} />
          </Card>

          <Card title="Ingresos vs. gastos" className={styles.wide}>
            <IncomeVsExpenseChart data={incomeVsExpense} />
          </Card>

          <Card title="Evolución del patrimonio" className={styles.wide}>
            <NetWorthTrendChart data={netWorthTrend} />
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
