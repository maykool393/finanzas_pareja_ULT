import type { ExpenseSplit } from '../features/household/preferences'
import { createSharedQuery, useSharedQuery } from '../lib/sharedQuery'
import { supabase } from '../lib/supabase'

export interface Household {
  id: string
  name: string
  currency: string
  expenseSplit: ExpenseSplit
}

export interface HouseholdPreferences {
  name: string
  currency: string
  expenseSplit: ExpenseSplit
}

/**
 * El hogar del usuario, compartido por toda la app (ver sharedQuery.ts): así,
 * al cambiar la moneda en "Ajustes del hogar", cambia en todas las pantallas
 * sin recargar. Sin filtrar por id: la policy `households_select_member` ya
 * devuelve solo el hogar propio.
 */
const householdQuery = createSharedQuery<Household | null>(async () => {
  const { data, error } = await supabase
    .from('households')
    .select('id, name, currency, expense_split')
    .maybeSingle()
  if (error) throw error
  return data
    ? { id: data.id, name: data.name, currency: data.currency, expenseSplit: data.expense_split as ExpenseSplit }
    : null
}, null)

/** Datos del household actual más allá del id: nombre, moneda y reparto de gastos. */
export function useHousehold() {
  const { data: household, loading, error } = useSharedQuery(householdQuery)

  async function updatePreferences(preferences: HouseholdPreferences) {
    if (!household) return
    // .select().single(): sin él, un update que RLS bloquea afecta 0 filas y no da error.
    const { error: updateError } = await supabase
      .from('households')
      .update({ name: preferences.name, currency: preferences.currency, expense_split: preferences.expenseSplit })
      .eq('id', household.id)
      .select()
      .single()
    if (updateError) throw updateError
    await householdQuery.refresh()
  }

  return { household, loading, error, retry: householdQuery.retry, refresh: householdQuery.refresh, updatePreferences }
}
