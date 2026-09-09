import { supabase } from '../../lib/supabase'
import type { Category, CategoryColor, CategoryType } from '../../types/domain'

type CategoryRow = {
  id: string
  household_id: string
  name: string
  type: string
  icon: string
  color: string
  archived_at: string | null
  created_at: string
  updated_at: string
}

function mapRow(row: CategoryRow): Category {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    type: row.type as CategoryType,
    icon: row.icon,
    color: row.color as CategoryColor,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface CategoryInput {
  name: string
  type: CategoryType
  icon: string
  color: CategoryColor
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function createCategory(householdId: string, input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ household_id: householdId, ...input })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase.from('categories').update(input).eq('id', id).select().single()
  if (error) throw error
  return mapRow(data)
}

export async function setCategoryArchived(id: string, archived: boolean): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
