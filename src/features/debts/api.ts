import { supabase } from '../../lib/supabase'
import type { ColorVariant, Debt } from '../../types/domain'

type DebtRow = {
  id: string
  household_id: string
  owner_id: string | null
  name: string
  principal: number
  remaining: number
  interest_rate: number | null
  due_date: string | null
  icon: string
  color_variant: string
  installment_amount: number | null
  installments_remaining: number | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: DebtRow): Debt {
  return {
    id: row.id,
    householdId: row.household_id,
    ownerId: row.owner_id,
    name: row.name,
    principal: row.principal,
    remaining: row.remaining,
    interestRate: row.interest_rate,
    dueDate: row.due_date,
    icon: row.icon,
    colorVariant: row.color_variant as ColorVariant,
    installmentAmount: row.installment_amount,
    installmentsRemaining: row.installments_remaining,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface DebtInput {
  name: string
  ownerId: string | null
  icon: string
  colorVariant: ColorVariant
  principal: number
  remaining: number
  installmentAmount: number | null
  installmentsRemaining: number | null
}

export async function listDebts(): Promise<Debt[]> {
  const { data, error } = await supabase.from('debts').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createDebt(householdId: string, input: DebtInput): Promise<Debt> {
  const { data, error } = await supabase
    .from('debts')
    .insert({
      household_id: householdId,
      name: input.name,
      owner_id: input.ownerId,
      icon: input.icon,
      color_variant: input.colorVariant,
      principal: input.principal,
      remaining: input.remaining,
      installment_amount: input.installmentAmount,
      installments_remaining: input.installmentsRemaining,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateDebt(id: string, input: DebtInput): Promise<Debt> {
  const { data, error } = await supabase
    .from('debts')
    .update({
      name: input.name,
      owner_id: input.ownerId,
      icon: input.icon,
      color_variant: input.colorVariant,
      principal: input.principal,
      remaining: input.remaining,
      installment_amount: input.installmentAmount,
      installments_remaining: input.installmentsRemaining,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function setDebtArchived(id: string, archived: boolean): Promise<void> {
  const { error } = await supabase
    .from('debts')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteDebt(id: string): Promise<void> {
  const { error } = await supabase.from('debts').delete().eq('id', id)
  if (error) throw error
}
