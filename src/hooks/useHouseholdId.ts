import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'

/** household_id del usuario actual — para setearlo al crear filas (RLS ya lo exige). */
export function useHouseholdId() {
  const { user } = useSession()
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
    setHouseholdId(data?.household_id ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    // Se usa detrás de RequireAuth: si aún no hay user, la sesión sigue
    // resolviendo — loading se mantiene true hasta que haya uno.
    if (!user) return
    // Falso positivo del linter: refresh es async y su primer setState llega
    // después del await, no de forma síncrona dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [user, refresh])

  return { householdId, loading, refresh }
}
