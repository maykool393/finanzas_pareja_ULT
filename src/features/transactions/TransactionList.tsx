import type { ReactNode } from 'react'
import { ICONS, type IconKey } from '../../components/ui/iconRegistry'
import { SwapIcon } from '../../components/ui/icons'
import { useCurrency } from '../../hooks/useCurrency'
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
  /** Qué mostrar sin movimientos: depende de dónde está la lista (primer uso, filtros sin resultados, dashboard). */
  empty: ReactNode
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

/**
 * Las dos mitades de un saldo (salida y entrada) van juntas en una fila: es
 * una transferencia, no un gasto y un ingreso. Si la otra mitad no está (un
 * filtro por cuenta, o quedó en la página siguiente), la fila va sola.
 */
function mergeTransfers(transactions: Transaction[]): Transaction[][] {
  const rows: Transaction[][] = []
  const bySettlement = new Map<string, Transaction[]>()
  for (const transaction of transactions) {
    if (!transaction.settlementId) {
      rows.push([transaction])
      continue
    }
    const legs = bySettlement.get(transaction.settlementId)
    if (legs) legs.push(transaction)
    else {
      const row = [transaction]
      bySettlement.set(transaction.settlementId, row)
      rows.push(row)
    }
  }
  // La salida primero: "Caixa → Banesco".
  for (const legs of bySettlement.values()) legs.sort((a, b) => a.amount - b.amount)
  return rows
}

export function TransactionList({ transactions, accounts, categories, members, onSelect, empty }: TransactionListProps) {
  const currency = useCurrency()

  if (transactions.length === 0) {
    return <>{empty}</>
  }

  return (
    <div className={styles.groups}>
      {groupByDay(transactions).map(([day, items]) => (
        <section key={day} className={styles.group}>
          <p className="label">{formatDate(day)}</p>
          <ul className={styles.list} role="list">
            {mergeTransfers(items).map((legs) => {
              const transaction = legs[0]
              const account = accounts.find((a) => a.id === transaction.accountId)
              const category = categories.find((c) => c.id === transaction.categoryId)
              const member = members.find((m) => m.id === transaction.memberId)
              const Icon = category ? (ICONS[category.icon as IconKey] ?? ICONS.other) : null
              const tone = category ? CATEGORY_COLOR_TOKENS[category.color] : null
              const isIncome = transaction.amount >= 0

              const content = transaction.settlementId ? (
                <>
                  <span className={styles.icon}>
                    <SwapIcon />
                  </span>
                  <span className={styles.info}>
                    <span className={styles.title}>Saldo de gastos compartidos</span>
                    <span className={styles.meta}>
                      {legs.length === 2
                        ? legs.map((leg) => accounts.find((a) => a.id === leg.accountId)?.name ?? 'Cuenta').join(' → ')
                        : [account?.name, member?.displayName].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  {/* Sin color de ingreso o gasto: no es ninguno de los dos. */}
                  <span className={`amount ${styles.amount}`}>
                    {formatCurrency(legs.length === 2 ? Math.abs(transaction.amount) : transaction.amount, currency, {
                      signed: legs.length !== 2,
                    })}
                  </span>
                </>
              ) : (
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
                  <span className={`amount ${styles.amount} ${isIncome ? styles.income : styles.expense}`}>
                    {formatCurrency(transaction.amount, currency, { signed: true })}
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
