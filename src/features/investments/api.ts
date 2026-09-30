import { supabase } from '../../lib/supabase'
import type { ColorVariant, Investment, InvestmentGroup } from '../../types/domain'

type InvestmentRow = {
  id: string
  household_id: string
  owner_id: string | null
  name: string
  invested: number
  current_value: number
  invested_at: string
  icon: string
  color_variant: string
  group_id: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: InvestmentRow): Investment {
  return {
    id: row.id,
    householdId: row.household_id,
    ownerId: row.owner_id,
    name: row.name,
    invested: row.invested,
    currentValue: row.current_value,
    investedAt: row.invested_at,
    icon: row.icon,
    colorVariant: row.color_variant as ColorVariant,
    // ?? null: antes de correr la migración 20260930192842 la columna no existe.
    groupId: row.group_id ?? null,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface InvestmentInput {
  name: string
  ownerId: string | null
  icon: string
  colorVariant: ColorVariant
  invested: number
  currentValue: number
  investedAt: string
  groupId: string | null
}

export async function listInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase.from('investments').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createInvestment(householdId: string, input: InvestmentInput): Promise<Investment> {
  const { data, error } = await supabase
    .from('investments')
    .insert({
      household_id: householdId,
      name: input.name,
      owner_id: input.ownerId,
      icon: input.icon,
      color_variant: input.colorVariant,
      invested: input.invested,
      current_value: input.currentValue,
      invested_at: input.investedAt,
      group_id: input.groupId,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateInvestment(id: string, input: InvestmentInput): Promise<Investment> {
  const { data, error } = await supabase
    .from('investments')
    .update({
      name: input.name,
      owner_id: input.ownerId,
      icon: input.icon,
      color_variant: input.colorVariant,
      invested: input.invested,
      current_value: input.currentValue,
      invested_at: input.investedAt,
      group_id: input.groupId,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function setInvestmentArchived(id: string, archived: boolean): Promise<void> {
  const { error } = await supabase
    .from('investments')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteInvestment(id: string): Promise<void> {
  const { error } = await supabase.from('investments').delete().eq('id', id)
  if (error) throw error
}

// ---------- Grupos (migración 20260930192842) ----------

type GroupRow = {
  id: string
  household_id: string
  name: string
  icon: string
  color_variant: string
  created_at: string
  updated_at: string
}

function mapGroup(row: GroupRow): InvestmentGroup {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    icon: row.icon,
    colorVariant: row.color_variant as ColorVariant,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface InvestmentGroupInput {
  name: string
  icon: string
  colorVariant: ColorVariant
}

export async function listInvestmentGroups(): Promise<InvestmentGroup[]> {
  const { data, error } = await supabase.from('investment_groups').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(mapGroup)
}

export async function createInvestmentGroup(householdId: string, input: InvestmentGroupInput): Promise<InvestmentGroup> {
  const { data, error } = await supabase
    .from('investment_groups')
    .insert({ household_id: householdId, name: input.name.trim(), icon: input.icon, color_variant: input.colorVariant })
    .select()
    .single()
  if (error) throw error
  return mapGroup(data)
}

export async function updateInvestmentGroup(id: string, input: InvestmentGroupInput): Promise<InvestmentGroup> {
  const { data, error } = await supabase
    .from('investment_groups')
    .update({ name: input.name.trim(), icon: input.icon, color_variant: input.colorVariant })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapGroup(data)
}

/** Sus inversiones quedan sin grupo ("Otras"): la base pone group_id en null. */
export async function deleteInvestmentGroup(id: string): Promise<void> {
  const { error } = await supabase.from('investment_groups').delete().eq('id', id)
  if (error) throw error
}
