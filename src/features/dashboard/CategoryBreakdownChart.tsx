import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../lib/format'
import styles from './CategoryBreakdownChart.module.css'
import { formatTooltipCurrency } from './tooltipFormat'
import type { CategoryBreakdownItem } from './useDashboardCharts'

export function CategoryBreakdownChart({ items }: { items: CategoryBreakdownItem[] }) {
  if (items.length === 0) {
    return <p className={styles.empty}>Sin gastos categorizados este mes.</p>
  }

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={items} dataKey="amount" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {items.map((item) => (
              <Cell key={item.categoryId} fill={item.bg} stroke={item.text} strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip
            formatter={formatTooltipCurrency}
            contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className={styles.legend}>
        {items.map((item) => (
          <li key={item.categoryId} className={styles.legendRow}>
            <span className={styles.swatch} style={{ background: item.bg, borderColor: item.text }} />
            <span className={styles.legendName}>{item.name}</span>
            <span className={`amount ${styles.legendAmount}`}>{formatCurrency(item.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
