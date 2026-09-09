import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styles from './charts.module.css'
import { formatTooltipCurrency } from './tooltipFormat'
import type { MonthlyTotals } from './useDashboardCharts'

export function IncomeVsExpenseChart({ data }: { data: MonthlyTotals[] }) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0)
  if (!hasData) {
    return <p className={styles.empty}>Sin movimientos en los últimos meses.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          formatter={formatTooltipCurrency}
          contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 8 }}
        />
        <Bar dataKey="income" name="Ingresos" fill="var(--gain-color)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Gastos" fill="var(--loss-color)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
