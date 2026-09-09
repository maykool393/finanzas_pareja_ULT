import { supabase } from '../../lib/supabase'
import type { Account, ColorVariant, AccountType } from '../../types/domain'

type AccountRow = {
  id: string
  household_id: string
  owner_id: string | null
  name: string
  type: string
  initial_balance: number
  balance: number
  icon: string
  color_variant: string
  currency: string
  archived_at: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: AccountRow): Account {
  return {
    id: row.id,
    householdId: row.household_id,
    ownerId: row.owner_id,
    name: row.name,
    type: row.type as AccountType,
    initialBalance: row.initial_balance,
    balance: row.balance,
    icon: row.icon,
    colorVariant: row.color_variant as ColorVariant,
    currency: row.currency,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface AccountInput {
  name: string
  type: AccountType
  ownerId: string | null
  icon: string
  colorVariant: ColorVariant
}

export async function listAccounts(): Promise<Account[]> {
  const { data, error } = await supabase.from('accounts').select('*').order('created_at')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createAccount(
  householdId: string,
  input: AccountInput,
  initialBalance: number,
): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .insert({
      household_id: householdId,
      name: input.name,
      type: input.type,
      owner_id: input.ownerId,
      icon: input.icon,
      color_variant: input.colorVariant,
      initial_balance: initialBalance,
      balance: initialBalance,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateAccount(id: string, input: AccountInput): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .update({
      name: input.name,
      type: input.type,
      owner_id: input.ownerId,
      icon: input.icon,
      color_variant: input.colorVariant,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function setAccountArchived(id: string, archived: boolean): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase.from('accounts').delete().eq('id', id)
  if (error) throw error
}
