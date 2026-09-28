import { createSharedQuery, useSharedQuery } from '../lib/sharedQuery'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/domain'

/**
 * Perfiles del household actual (incluido el propio), compartidos por toda la
 * app (ver sharedQuery.ts). Sin filtrar household_id a mano: la policy
 * `profiles_select_self_or_household` ya limita el resultado a "yo + mi
 * pareja", así que basta con pedir todo.
 *
 * Ordenados por fecha de registro: así cada persona tiene siempre el mismo
 * color (la primera, --person-a; la segunda, --person-b), para los dos.
 */
const membersQuery = createSharedQuery<Profile[]>(async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, household_id, display_name, avatar_url, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map((row) => ({
    id: row.id,
    householdId: row.household_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  }))
}, [])

export function useHouseholdMembers() {
  const { data: members, loading } = useSharedQuery(membersQuery)
  return { members, loading }
}
