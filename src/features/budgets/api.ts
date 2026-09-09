import { supabase } from '../../lib/supabase'
import type { Budget } from '../../types/domain'

type BudgetRow = {
  id: string
  household_id: string
  category_id: string
  period_month: string
  amount: number
  created_at: string
  updated_at: string
}

function mapRow(row: BudgetRow): Budget {
  return {
    id: row.id,
    householdId: row.household_id,
    categoryId: row.category_id,
    periodMonth: row.period_month,
    amount: row.amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listBudgets(periodMonth: string): Promise<Budget[]> {
  const { data, error } = await supabase.from('budgets').select('*').eq('period_month', periodMonth)
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export interface BudgetInput {
  categoryId: string
  periodMonth: string
  amount: number
}

export async function createBudget(householdId: string, input: BudgetInput): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      household_id: householdId,
      category_id: input.categoryId,
      period_month: input.periodMonth,
      amount: input.amount,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateBudgetAmount(id: string, amount: number): Promise<Budget> {
  const { data, error } = await supabase.from('budgets').update({ amount }).eq('id', id).select().single()
  if (error) throw error
  return mapRow(data)
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('id', id)
  if (error) throw error
}
