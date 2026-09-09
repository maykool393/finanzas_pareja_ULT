import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/domain'

/**
 * Perfiles del household actual (incluido el propio). Sin filtrar household_id
 * a mano: la policy `profiles_select_self_or_household` ya limita el resultado
 * a "yo + mi pareja", así que basta con pedir todo.
 */
export function useHouseholdMembers() {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase
      .from('profiles')
      .select('id, household_id, display_name, avatar_url')
      .then(({ data }) => {
        if (!active) return
        setMembers(
          (data ?? []).map((row) => ({
            id: row.id,
            householdId: row.household_id,
            displayName: row.display_name,
            avatarUrl: row.avatar_url,
          })),
        )
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { members, loading }
}
