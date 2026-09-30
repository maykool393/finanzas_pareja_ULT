import type { Account, Budget, Category, Profile, Settlement, Transaction } from '../../types/domain'
import type { ExpenseSplit } from '../household/preferences'

/**
 * Cálculos de las historias del Resumen (DESIGN.md § Resumen). Funciones
 * puras: reciben los datos del mes ya cargados.
 *
 * Las transferencias de un saldo (settlementId) no son ingreso ni gasto:
 * ninguna historia las cuenta.
 */

const isMovement = (t: Transaction) => t.settlementId === null

function sum(values: number[]) {
  return values.reduce((acc, v) => acc + v, 0)
}

// ---------- Historia 1: Ingresos vs. gastos ----------

export interface MonthTotals {
  income: number
  expense: number // en positivo
  incomeCount: number
  expenseCount: number
}

export function monthTotals(transactions: Transaction[]): MonthTotals {
  const movements = transactions.filter(isMovement)
  const incomes = movements.filter((t) => t.amount > 0)
  const expenses = movements.filter((t) => t.amount < 0)
  return {
    income: sum(incomes.map((t) => t.amount)),
    expense: sum(expenses.map((t) => -t.amount)),
    incomeCount: incomes.length,
    expenseCount: expenses.length,
  }
}

// ---------- Historia 2: Gastos compartidos ----------

export interface PersonShare {
  member: Profile
  /** Parte de los gastos compartidos que le toca, de 0 a 1. */
  ratio: number
  /** "Le tocaba": el total por su parte. */
  share: number
  /** "Pagó": desde sus cuentas, más su parte de lo pagado desde una cuenta compartida. */
  paid: number
}

export interface SharedSummary {
  /** Gastos compartidos del mes: los gastos sin titular. */
  total: number
  people: [PersonShare, PersonShare]
  /** Reparto proporcional sin ingresos de alguno: se repartió 50 / 50. Quiénes no registraron. */
  missingIncome: Profile[]
  /** Lo que queda por saldar, ya descontados los saldos del mes. null = no se deben nada. */
  debt: { from: Profile; to: Profile; amount: number } | null
  /** Lo transferido con "Saldar" en el mes. */
  settled: number
}

interface SharedInput {
  transactions: Transaction[]
  accounts: Account[]
  /** Los dos miembros, en orden de registro (el primero es la persona "a"). */
  members: [Profile, Profile]
  split: Exclude<ExpenseSplit, 'indiferente'>
  settlements: Settlement[]
  /** Decimales de la moneda: por debajo de su unidad mínima, están a mano. */
  decimals: number
}

/**
 * Quién pagó qué de los gastos compartidos y cuánto le toca a cada uno
 * (DESIGN.md § Resumen, "Cómo se calcula").
 */
export function sharedSummary({ transactions, accounts, members, split, settlements, decimals }: SharedInput): SharedSummary {
  const [a, b] = members
  const movements = transactions.filter(isMovement)

  // Parte de cada uno: la mitad, o según los ingresos del mes con su titular.
  let ratioA = 0.5
  const missingIncome: Profile[] = []
  if (split === 'proporcional') {
    const incomeOf = (member: Profile) =>
      sum(movements.filter((t) => t.amount > 0 && t.memberId === member.id).map((t) => t.amount))
    const incomeA = incomeOf(a)
    const incomeB = incomeOf(b)
    if (incomeA > 0 && incomeB > 0) ratioA = incomeA / (incomeA + incomeB)
    else missingIncome.push(...[a, b].filter((_, i) => (i === 0 ? incomeA : incomeB) <= 0))
  }

  // Quién pagó: el dueño de la cuenta. Desde una cuenta compartida (o de
  // alguien que ya no está) pagaron los dos en su proporción: no genera saldo.
  let total = 0
  let paidA = 0
  let paidB = 0
  const ownerOf = new Map(accounts.map((account) => [account.id, account.ownerId]))
  for (const t of movements) {
    if (t.amount >= 0 || t.memberId !== null) continue
    const amount = -t.amount
    total += amount
    const owner = ownerOf.get(t.accountId)
    if (owner === a.id) paidA += amount
    else if (owner === b.id) paidB += amount
    else {
      paidA += amount * ratioA
      paidB += amount * (1 - ratioA)
    }
  }

  const shareA = total * ratioA
  const shareB = total - shareA

  // Positivo: a pagó de más y b le debe. Transferir sube lo que puso quien
  // transfiere y baja lo que puso quien recibe.
  let netA = paidA - shareA
  let settled = 0
  for (const s of settlements) {
    settled += s.amount
    if (s.fromMemberId === a.id && s.toMemberId === b.id) netA += s.amount
    else if (s.fromMemberId === b.id && s.toMemberId === a.id) netA -= s.amount
  }

  const factor = 10 ** decimals
  const pending = Math.round(Math.abs(netA) * factor) / factor
  const debt = pending === 0 ? null : netA > 0 ? { from: b, to: a, amount: pending } : { from: a, to: b, amount: pending }

  return {
    total,
    people: [
      { member: a, ratio: ratioA, share: shareA, paid: paidA },
      { member: b, ratio: 1 - ratioA, share: shareB, paid: paidB },
    ],
    missingIncome,
    debt,
    settled,
  }
}

/** Porcentajes enteros que suman 100 (60 / 40), para las píldoras. */
export function splitPercents(ratioA: number): [number, number] {
  const pctA = Math.round(ratioA * 100)
  return [pctA, 100 - pctA]
}

// ---------- Historia 3: Presupuestos ----------

export interface BudgetBar {
  key: string
  label: string
  spent: number
  amount: number
  /** spent / amount; puede pasar de 1. */
  ratio: number
}

export interface BudgetStoryData {
  /** "Gasto": todos los presupuestos de gasto del mes juntos. */
  total: BudgetBar
  /** Las dos categorías más cerca de su límite (o pasadas). Vacío con un solo presupuesto: repetiría el total. */
  top: BudgetBar[]
}

/**
 * Mientras no existan los presupuestos de Inversión y Deuda (DESIGN.md §
 * Resumen, historia 3). null = no hay presupuestos de gasto ese mes.
 */
export function budgetStory(budgets: Budget[], transactions: Transaction[], categories: Category[]): BudgetStoryData | null {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  // Como la pantalla Presupuesto: el valor absoluto de lo categorizado. Una
  // categoría es de un solo tipo, así que sus movimientos ya son de gasto.
  const spentByCategory = new Map<string, number>()
  for (const t of transactions.filter(isMovement)) {
    if (!t.categoryId) continue
    spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) ?? 0) + Math.abs(t.amount))
  }

  const bars: BudgetBar[] = budgets
    .filter((budget) => categoryById.get(budget.categoryId)?.type === 'expense')
    .map((budget) => {
      const spent = spentByCategory.get(budget.categoryId) ?? 0
      return {
        key: budget.categoryId,
        label: categoryById.get(budget.categoryId)?.name ?? 'Categoría',
        spent,
        amount: budget.amount,
        ratio: budget.amount > 0 ? spent / budget.amount : 0,
      }
    })
  if (bars.length === 0) return null

  const spent = sum(bars.map((bar) => bar.spent))
  const amount = sum(bars.map((bar) => bar.amount))
  const top = bars.length >= 2 ? [...bars].sort((x, y) => y.ratio - x.ratio).slice(0, 2) : []

  return { total: { key: 'gasto', label: 'Gasto', spent, amount, ratio: amount > 0 ? spent / amount : 0 }, top }
}
