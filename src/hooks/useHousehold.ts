import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useHouseholdId } from './useHouseholdId'

export interface Household {
  id: string
  name: string
  currency: string
  expenseSplit: string
}

/** Datos del household actual más allá del id — moneda principal y reparto de gastos, elegidos en el onboarding. */
export function useHousehold() {
  const { householdId } = useHouseholdId()
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!householdId) return
    const { data } = await supabase
      .from('households')
      .select('id, name, currency, expense_split')
      .eq('id', householdId)
      .single()
    setHousehold(
      data ? { id: data.id, name: data.name, currency: data.currency, expenseSplit: data.expense_split } : null,
    )
    setLoading(false)
  }, [householdId])

  useEffect(() => {
    if (!householdId) return
    // Falso positivo del linter: refresh es async y su primer setState llega
    // después del await, no de forma síncrona dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [householdId, refresh])

  return { household, loading, refresh }
}
