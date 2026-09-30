import { supabase } from '../../lib/supabase'
import type { Transaction, TransactionFilters } from '../../types/domain'

type TransactionRow = {
  id: string
  household_id: string
  account_id: string
  category_id: string | null
  member_id: string | null
  created_by: string
  amount: number
  description: string | null
  occurred_at: string
  settlement_id: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    householdId: row.household_id,
    accountId: row.account_id,
    categoryId: row.category_id,
    memberId: row.member_id,
    createdBy: row.created_by,
    amount: row.amount,
    description: row.description,
    occurredAt: row.occurred_at,
    // ?? null: antes de correr la migración de R7 la columna no existe.
    settlementId: row.settlement_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface TransactionInput {
  accountId: string
  categoryId: string | null
  memberId: string | null
  amount: number // ya con el signo aplicado (negativo = gasto, positivo = ingreso)
  description: string | null
  occurredAt: string // 'YYYY-MM-DD'
}

/** 'YYYY-MM-DD' -> el día siguiente, para un filtro "hasta" inclusivo sobre una columna timestamptz. */
function dayAfter(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

/** Filas por pedido: el tope por defecto de la API de Supabase (`max-rows`). */
const API_MAX_ROWS = 1000

function transactionsQuery(filters: TransactionFilters) {
  // id como desempate: con el mismo día, el orden tiene que ser estable para
  // que dos páginas seguidas no repitan ni salten filas.
  let query = supabase
    .from('transactions')
    .select('*')
    .order('occurred_at', { ascending: false })
    .order('id', { ascending: false })

  if (filters.accountId) query = query.eq('account_id', filters.accountId)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.memberId) query = query.eq('member_id', filters.memberId)
  if (filters.from) query = query.gte('occurred_at', filters.from)
  if (filters.to) query = query.lt('occurred_at', dayAfter(filters.to))
  return query
}

/** Una página de movimientos, del más nuevo al más antiguo. */
export async function listTransactionsPage(
  filters: TransactionFilters,
  offset: number,
  limit: number,
): Promise<Transaction[]> {
  const { data, error } = await transactionsQuery(filters).range(offset, offset + limit - 1)
  if (error) throw error
  return (data ?? []).map(mapRow)
}

/**
 * Los movimientos que cumplen los filtros (hasta `max`), pedidos en bloques de
 * 1000. Sin `max`, todos: para rangos acotados que se suman completos
 * (gráficos, presupuestos). Un solo pedido se cortaría en silencio en la fila
 * 1000 y los totales saldrían bajos.
 */
export async function listTransactions(filters: TransactionFilters = {}, max = Infinity): Promise<Transaction[]> {
  const all: Transaction[] = []
  while (all.length < max) {
    const limit = Math.min(API_MAX_ROWS, max - all.length)
    const page = await listTransactionsPage(filters, all.length, limit)
    all.push(...page)
    if (page.length < limit) break
  }
  return all
}

export async function createTransaction(
  householdId: string,
  createdBy: string,
  input: TransactionInput,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      household_id: householdId,
      account_id: input.accountId,
      category_id: input.categoryId,
      member_id: input.memberId,
      created_by: createdBy,
      amount: input.amount,
      description: input.description,
      occurred_at: input.occurredAt,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      account_id: input.accountId,
      category_id: input.categoryId,
      member_id: input.memberId,
      amount: input.amount,
      description: input.description,
      occurred_at: input.occurredAt,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
