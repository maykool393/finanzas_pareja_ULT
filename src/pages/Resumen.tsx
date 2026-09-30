import { type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeaderExtension } from '../components/layout/HeaderExtension'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { FloatingButton } from '../components/ui/FloatingButton'
import { PlusIcon } from '../components/ui/icons'
import { refreshAccounts, useAccounts } from '../features/accounts/useAccounts'
import { useCategories } from '../features/categories/useCategories'
import { BudgetStory } from '../features/resumen/BudgetStory'
import { IncomeStory } from '../features/resumen/IncomeStory'
import { MonthNavigator } from '../features/resumen/MonthNavigator'
import { SettleForm } from '../features/resumen/SettleForm'
import { SharedStory } from '../features/resumen/SharedStory'
import { type StoryDef, Stories } from '../features/resumen/Stories'
import { budgetStory, monthTotals, sharedSummary } from '../features/resumen/summary'
import { type MonthData, useMonthSummary } from '../features/resumen/useMonthSummary'
import { createSettlement } from '../features/settlements/api'
import { useCurrency } from '../hooks/useCurrency'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHousehold } from '../hooks/useHousehold'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import { ERROR_MESSAGES } from '../lib/errorMessages'
import { getCurrencyDecimals } from '../lib/format'
import { currentPeriodMonth, monthName } from '../lib/month'
import styles from './Resumen.module.css'

/**
 * Inicio de la app: las historias del mes (DESIGN.md § Resumen). En pareja,
 * tres; en un hogar de una persona o con reparto "Indiferente", dos: no hay
 * gastos compartidos que consolidar.
 */
export function Resumen() {
  useDocumentTitle('Resumen')
  const navigate = useNavigate()
  const currency = useCurrency()
  const latest = currentPeriodMonth()
  const [month, setMonth] = useState(latest)
  const [index, setIndex] = useState(0)
  const [settleOpen, setSettleOpen] = useState(false)

  const { data, loading, error, retry, refresh } = useMonthSummary(month)
  const { members } = useHouseholdMembers()
  const { household } = useHousehold()
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const name = monthName(month)
  const split = household?.expenseSplit
  const couple = members.length >= 2 && split !== undefined && split !== 'indiferente'

  const shared =
    couple && data
      ? sharedSummary({
          transactions: data.transactions,
          accounts,
          members: [members[0], members[1]],
          split,
          settlements: data.settlements,
          decimals: getCurrencyDecimals(currency),
        })
      : null

  // Mientras carga o si falla, cada historia muestra lo mismo en su lugar.
  function body(render: (monthData: MonthData) => ReactNode) {
    if (error) {
      return (
        <div className={styles.state}>
          <p>{ERROR_MESSAGES.load}</p>
          <Button variant="secondary" onClick={retry}>
            Reintentar
          </Button>
        </div>
      )
    }
    if (loading || !data) {
      return (
        <div className={styles.state} aria-busy="true">
          <span className={styles.skeleton} />
          <span className="visually-hidden">Cargando…</span>
        </div>
      )
    }
    return render(data)
  }

  const stories: StoryDef[] = [
    {
      key: 'ingresos',
      title: 'Ingresos vs. gastos',
      help: `Así se compara el dinero que entró y el que salió en ${name}.`,
      tone: 'light',
      content: body((d) => <IncomeStory totals={monthTotals(d.transactions)} currency={currency} monthName={name} />),
    },
    ...(couple
      ? [
          {
            key: 'compartidos',
            title: 'Gastos compartidos',
            help: 'Así quedó repartido lo que gastaron juntos y quién le debe a quién.',
            tone: 'dark',
            content: body(
              (d) =>
                shared && (
                  <SharedStory
                    summary={shared}
                    members={members}
                    currency={currency}
                    monthName={name}
                    hasSettlements={d.settlements.length > 0}
                    onSettle={() => setSettleOpen(true)}
                  />
                ),
            ),
          } satisfies StoryDef,
        ]
      : []),
    {
      key: 'presupuestos',
      title: 'Presupuestos',
      help: `Así va ${name} en los gastos con presupuesto.`,
      tone: 'light',
      content: body((d) => (
        <BudgetStory data={budgetStory(d.budgets, d.transactions, categories)} currency={currency} monthName={name} />
      )),
    },
  ]
  // Si el hogar deja de tener la historia 2 (ej. cambia a "Indiferente"), el índice podría quedar fuera.
  const safeIndex = Math.min(index, stories.length - 1)

  return (
    <div className={styles.page}>
      {/* La cabecera ya dice "Nuestro resumen": el título queda para lectores de pantalla. */}
      <h1 className="visually-hidden">Resumen</h1>

      <HeaderExtension>
        <MonthNavigator month={month} onChange={setMonth} latest={latest} />
      </HeaderExtension>

      <Stories stories={stories} index={safeIndex} onIndexChange={setIndex} replayKey={month} />

      <FloatingButton label="Añadir movimiento" icon={<PlusIcon />} onClick={() => navigate('/movimientos?nuevo=1')} />

      <Dialog open={settleOpen} onClose={() => setSettleOpen(false)} title="Saldar gastos compartidos">
        {shared?.debt && (
          <SettleForm
            debt={shared.debt}
            periodMonth={month}
            accounts={accounts}
            onSubmit={async (input) => {
              await createSettlement(input)
              await Promise.all([refresh(), refreshAccounts()])
              setSettleOpen(false)
            }}
            onCancel={() => setSettleOpen(false)}
          />
        )}
      </Dialog>
    </div>
  )
}
