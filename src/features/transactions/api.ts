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

export async function listTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
  let query = supabase.from('transactions').select('*').order('occurred_at', { ascending: false })

  if (filters.accountId) query = query.eq('account_id', filters.accountId)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.memberId) query = query.eq('member_id', filters.memberId)
  if (filters.from) query = query.gte('occurred_at', filters.from)
  if (filters.to) query = query.lt('occurred_at', dayAfter(filters.to))

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapRow)
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
