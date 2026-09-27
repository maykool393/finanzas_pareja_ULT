import { createSharedQuery, useSharedQuery } from '../lib/sharedQuery'
import { supabase } from '../lib/supabase'

/**
 * household_id del usuario actual, compartido por toda la app (ver
 * sharedQuery.ts): antes cada hook de datos lo pedía por su cuenta.
 */
const householdIdQuery = createSharedQuery<string | null>(async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) return null
  const { data, error } = await supabase.from('profiles').select('household_id').eq('id', userId).single()
  if (error) throw error
  return data.household_id
}, null)

/** household_id del usuario actual — para setearlo al crear filas (RLS ya lo exige). Se usa detrás de RequireAuth. */
export function useHouseholdId() {
  const { data: householdId, loading, error } = useSharedQuery(householdIdQuery)
  return { householdId, loading, error, refresh: householdIdQuery.refresh, retry: householdIdQuery.retry }
}
