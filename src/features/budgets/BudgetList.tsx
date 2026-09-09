import { ProgressBar } from '../../components/ui/ProgressBar'
import { ICONS, type IconKey } from '../../components/ui/icons'
import { formatCurrency } from '../../lib/format'
import type { BudgetProgress, Category, CategoryType } from '../../types/domain'
import { CATEGORY_COLOR_TOKENS } from '../categories/colors'
import styles from './BudgetList.module.css'

interface BudgetListProps {
  budgets: BudgetProgress[]
  categories: Category[]
  onEdit: (budget: BudgetProgress) => void
  onDelete: (budget: BudgetProgress) => void
}

/**
 * Gasto (límite a no superar): <80% verde, 80–100% color propio, ≥100% rojo.
 * Ingreso (meta a alcanzar): superarla es bueno, no hay estado de alarma —
 * color propio mientras no se alcanza, verde al llegar o superarla.
 */
function fillColorFor(ratio: number, type: CategoryType, categoryTextColor: string | undefined) {
  if (type === 'income') {
    return ratio >= 1 ? 'var(--gain-color)' : (categoryTextColor ?? 'var(--text-primary)')
  }
  if (ratio >= 1) return 'var(--loss-color)'
  if (ratio >= 0.8) return categoryTextColor ?? 'var(--text-primary)'
  return 'var(--gain-color)'
}

export function BudgetList({ budgets, categories, onEdit, onDelete }: BudgetListProps) {
  if (budgets.length === 0) {
    return <p className={styles.empty}>Sin presupuestos este mes.</p>
  }

  return (
    <ul className={styles.list}>
      {budgets.map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId)
        const Icon = category ? (ICONS[category.icon as IconKey] ?? ICONS.other) : ICONS.other
        const tone = category ? CATEGORY_COLOR_TOKENS[category.color] : null

        return (
          <li key={budget.id} className={styles.row}>
            <div className={styles.top}>
              <span className={styles.icon} style={tone ? { background: tone.bg, color: tone.text } : undefined}>
                <Icon />
              </span>
              <span className={styles.name}>{category?.name ?? 'Categoría'}</span>
              <div className={styles.actions}>
                <button type="button" onClick={() => onEdit(budget)}>
                  Editar
                </button>
                <button type="button" onClick={() => onDelete(budget)}>
                  Eliminar
                </button>
              </div>
            </div>

            <ProgressBar
              ratio={budget.ratio}
              trackColor="var(--surface-sunken)"
              fillColor={fillColorFor(budget.ratio, category?.type ?? 'expense', tone?.text)}
            />

            <p className={styles.amounts}>
              {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
