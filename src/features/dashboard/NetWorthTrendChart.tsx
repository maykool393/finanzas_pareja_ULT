import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate } from '../../lib/format'
import { formatTooltipCurrency, formatTooltipDate } from './tooltipFormat'
import type { NetWorthPoint } from './useDashboardCharts'

export function NetWorthTrendChart({ data }: { data: NetWorthPoint[] }) {
  const tickInterval = Math.max(Math.floor(data.length / 6), 1)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--account-b-text)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--account-b-text)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => formatDate(value)}
          interval={tickInterval}
          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--border)' }}
          tickLine={false}
        />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip
          formatter={formatTooltipCurrency}
          labelFormatter={formatTooltipDate}
          contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 8 }}
        />
        <Area type="monotone" dataKey="netWorth" stroke="var(--account-b-text)" strokeWidth={2} fill="url(#netWorthFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
