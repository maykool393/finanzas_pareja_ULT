import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency, formatDate } from '../../lib/format'
import {
  CHART_AXIS_TICK,
  CHART_TOOLTIP_ITEM_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  formatTooltipDate,
} from './tooltipFormat'
import type { NetWorthPoint } from './useDashboardCharts'

export function NetWorthTrendChart({ data }: { data: NetWorthPoint[] }) {
  const currency = useCurrency()
  const tickInterval = Math.max(Math.floor(data.length / 6), 1)

  // Resumen en texto para lectores de pantalla: el gráfico es solo SVG.
  const first = data[0]
  const last = data[data.length - 1]
  const summary = first && last
    ? `Entre el ${formatDate(first.date)} y el ${formatDate(last.date)}, el patrimonio pasó de ` +
      `${formatCurrency(first.netWorth, currency)} a ${formatCurrency(last.netWorth, currency)}.`
    : ''

  return (
    <>
      <p className="visually-hidden">{summary}</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--account-b)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--account-b)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDate(value)}
            interval={tickInterval}
            // Sin margen, la primera fecha queda medio fuera del gráfico ("9 jun").
            padding={{ left: 16, right: 16 }}
            tick={CHART_AXIS_TICK}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: unknown) => formatCurrency(Number(value), currency)}
            labelFormatter={formatTooltipDate}
            contentStyle={CHART_TOOLTIP_STYLE}
            itemStyle={CHART_TOOLTIP_ITEM_STYLE}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
          />
          <Area type="monotone" dataKey="netWorth" stroke="var(--account-b)" strokeWidth={2} fill="url(#netWorthFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}
