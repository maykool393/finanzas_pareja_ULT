import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency } from '../../lib/format'
import styles from './charts.module.css'
import { CHART_AXIS_TICK, CHART_TOOLTIP_STYLE } from './tooltipFormat'
import type { MonthlyTotals } from './useDashboardCharts'

export function IncomeVsExpenseChart({ data }: { data: MonthlyTotals[] }) {
  const currency = useCurrency()
  const hasData = data.some((d) => d.income > 0 || d.expense > 0)
  if (!hasData) {
    return <p className={styles.empty}>Sin movimientos en los últimos meses.</p>
  }

  // Resumen en texto para lectores de pantalla: el gráfico es solo SVG.
  const current = data[data.length - 1]
  const maxExpense = data.reduce((max, d) => (d.expense > max.expense ? d : max), data[0])
  const summary =
    `Últimos ${data.length} meses. Este mes: ingresos ${formatCurrency(current.income, currency)}, ` +
    `gastos ${formatCurrency(current.expense, currency)}. ` +
    `Mes con más gastos: ${maxExpense.label}, ${formatCurrency(maxExpense.expense, currency)}.`

  return (
    <>
      <p className="visually-hidden">{summary}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={CHART_AXIS_TICK}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value: unknown) => formatCurrency(Number(value), currency)}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Bar dataKey="income" name="Ingresos" fill="var(--gain-color)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Gastos" fill="var(--loss-color)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}
