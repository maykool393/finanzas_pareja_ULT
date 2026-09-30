import { supabase } from '../../lib/supabase'
import type { Settlement } from '../../types/domain'

type SettlementRow = {
  id: string
  household_id: string
  period_month: string
  from_member_id: string | null
  to_member_id: string | null
  amount: number
  created_at: string
}

function mapRow(row: SettlementRow): Settlement {
  return {
    id: row.id,
    householdId: row.household_id,
    periodMonth: row.period_month,
    fromMemberId: row.from_member_id,
    toMemberId: row.to_member_id,
    amount: Number(row.amount),
    createdAt: row.created_at,
  }
}

/** Los saldos de un mes ('YYYY-MM-01'). La policy ya limita al propio hogar. */
export async function listSettlements(periodMonth: string): Promise<Settlement[]> {
  const { data, error } = await supabase.from('settlements').select('*').eq('period_month', periodMonth)
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export interface SettlementInput {
  periodMonth: string
  fromAccountId: string
  toAccountId: string
  amount: number
  occurredAt: string // 'YYYY-MM-DD'
}

/**
 * Registra el saldo y sus dos movimientos en una sola llamada
 * (create_settlement): de quién y a quién salen de los dueños de las cuentas.
 */
export async function createSettlement(input: SettlementInput): Promise<string> {
  const { data, error } = await supabase.rpc('create_settlement', {
    p_period_month: input.periodMonth,
    p_from_account_id: input.fromAccountId,
    p_to_account_id: input.toAccountId,
    p_amount: input.amount,
    p_occurred_at: input.occurredAt,
  })
  if (error) throw error
  return data
}

/** Elimina el saldo; la base elimina sus dos movimientos y devuelve los saldos de las cuentas. */
export async function deleteSettlement(id: string): Promise<void> {
  // .select(): sin él, un delete que la RLS bloquea afecta 0 filas y no da error.
  const { data, error } = await supabase.from('settlements').delete().eq('id', id).select('id')
  if (error) throw error
  if (!data || data.length === 0) throw new Error('El saldo no existe.')
}
