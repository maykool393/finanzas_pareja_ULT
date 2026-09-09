import { ICONS, type IconKey } from '../../components/ui/icons'
import { formatCurrency, formatDate } from '../../lib/format'
import type { Account, Category, Profile, Transaction } from '../../types/domain'
import { CATEGORY_COLOR_TOKENS } from '../categories/colors'
import styles from './TransactionList.module.css'

interface TransactionListProps {
  transactions: Transaction[]
  accounts: Account[]
  categories: Category[]
  members: Profile[]
  /** Si se omite, la lista es de solo lectura (ej. vista previa en el dashboard). */
  onSelect?: (transaction: Transaction) => void
}

function groupByDay(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>()
  for (const transaction of transactions) {
    const day = transaction.occurredAt.slice(0, 10)
    const list = groups.get(day) ?? []
    list.push(transaction)
    groups.set(day, list)
  }
  return [...groups.entries()].sort(([a], [b]) => (a < b ? 1 : -1))
}

export function TransactionList({ transactions, accounts, categories, members, onSelect }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className={styles.empty}>Aún no hay movimientos registrados.</p>
  }

  return (
    <div className={styles.groups}>
      {groupByDay(transactions).map(([day, items]) => (
        <section key={day} className={styles.group}>
          <p className="label">{formatDate(day)}</p>
          <ul className={styles.list}>
            {items.map((transaction) => {
              const account = accounts.find((a) => a.id === transaction.accountId)
              const category = categories.find((c) => c.id === transaction.categoryId)
              const member = members.find((m) => m.id === transaction.memberId)
              const Icon = category ? (ICONS[category.icon as IconKey] ?? ICONS.other) : null
              const tone = category ? CATEGORY_COLOR_TOKENS[category.color] : null
              const isIncome = transaction.amount >= 0

              const content = (
                <>
                  <span className={styles.icon} style={tone ? { background: tone.bg, color: tone.text } : undefined}>
                    {Icon && <Icon />}
                  </span>
                  <span className={styles.info}>
                    <span className={styles.title}>
                      {transaction.description || category?.name || account?.name || 'Movimiento'}
                    </span>
                    <span className={styles.meta}>
                      {[account?.name, member?.displayName].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span
                    className={`amount ${styles.amount}`}
                    style={{ color: isIncome ? 'var(--gain-color)' : 'var(--loss-color)' }}
                  >
                    {isIncome ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                </>
              )

              return (
                <li key={transaction.id}>
                  {onSelect ? (
                    <button type="button" className={styles.row} onClick={() => onSelect(transaction)}>
                      {content}
                    </button>
                  ) : (
                    <div className={styles.row}>{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
