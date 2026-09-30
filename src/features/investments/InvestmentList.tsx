import { IconButton } from '../../components/ui/IconButton'
import { ICONS, type AccountIconKey } from '../../components/ui/iconRegistry'
import { PlusIcon } from '../../components/ui/icons'
import { useCurrency } from '../../hooks/useCurrency'
import { formatCurrency, formatDate, formatPercent } from '../../lib/format'
import type { Investment, InvestmentGroup } from '../../types/domain'
import styles from './InvestmentList.module.css'

/** Variación desde lo invertido, con signo: "+10 %", "-5 %", o null sin monto invertido. */
function variation(investment: Investment) {
  if (investment.invested <= 0) return null
  const ratio = (investment.currentValue - investment.invested) / investment.invested
  if (ratio === 0) return { text: formatPercent(0), tone: null }
  return {
    text: `${ratio > 0 ? '+' : '-'}${formatPercent(Math.abs(ratio))}`,
    tone: ratio > 0 ? styles.gain : styles.loss,
  }
}

interface InvestmentListProps {
  items: Investment[]
  groups: InvestmentGroup[]
  onSelect: (investment: Investment) => void
  /** + de un grupo: crear una inversión ya dentro de él. */
  onAddToGroup: (groupId: string) => void
  onEditGroup: (group: InvestmentGroup) => void
}

/**
 * Inversiones en lista agrupada (DESIGN.md § Lista de inversiones): un
 * contenedor por grupo, con su cuadro de ícono y un botón +; las que no
 * tienen grupo van al final, en "Otras". Cada fila abre la edición.
 */
export function InvestmentList({ items, groups, onSelect, onAddToGroup, onEditGroup }: InvestmentListProps) {
  const currency = useCurrency()

  // Solo los grupos con inversiones activas; uno vacío no ocupa lugar (se ve en el formulario).
  const sections = groups
    .map((group) => ({ group, items: items.filter((i) => i.groupId === group.id) }))
    .filter((section) => section.items.length > 0)
  const known = new Set(groups.map((g) => g.id))
  const others = items.filter((i) => !i.groupId || !known.has(i.groupId))

  function rows(list: Investment[]) {
    return (
      <ul role="list">
        {list.map((investment) => {
          const change = variation(investment)
          const value = formatCurrency(investment.currentValue, currency)
          const label = [investment.name, value, change?.text, `desde el ${formatDate(investment.investedAt)}`]
            .filter(Boolean)
            .join(', ')

          return (
            <li key={investment.id}>
              <button type="button" className={styles.row} onClick={() => onSelect(investment)} aria-label={label}>
                <span className={styles.start}>
                  <span className={styles.name}>{investment.name}</span>
                  <span className={styles.meta}>{formatDate(investment.investedAt)}</span>
                </span>
                <span className={styles.end}>
                  <span className={`amount ${styles.value}`}>{value}</span>
                  {change && <span className={`amount ${styles.change} ${change.tone ?? ''}`}>{change.text}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className={styles.groups}>
      {sections.map(({ group, items: groupItems }) => {
        const Icon = ICONS[group.icon as AccountIconKey] ?? ICONS['trend-up']
        return (
          <section key={group.id} className={styles.list} aria-label={group.name}>
            <div className={styles.groupHeader}>
              {/* El nombre abre la edición del grupo (renombrar, color, eliminar). */}
              <button type="button" className={styles.groupName} onClick={() => onEditGroup(group)} aria-label={`Editar grupo ${group.name}`}>
                <span className={`${styles.tile} ${group.colorVariant === 'b' ? styles.tileB : styles.tileA}`}>
                  <Icon aria-hidden="true" />
                </span>
                <span>{group.name}</span>
              </button>
              <IconButton label={`Añadir a ${group.name}`} icon={<PlusIcon />} size={28} onClick={() => onAddToGroup(group.id)} />
            </div>
            {rows(groupItems)}
          </section>
        )
      })}

      {others.length > 0 && (
        <section className={styles.list} aria-label={sections.length > 0 ? 'Otras' : 'Inversiones'}>
          {sections.length > 0 && <p className={styles.othersTitle}>Otras</p>}
          {rows(others)}
        </section>
      )}
    </div>
  )
}
