import { useCallback, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import type { Investment } from '../../types/domain'
import {
  type InvestmentInput,
  createInvestment,
  deleteInvestment,
  listInvestments,
  setInvestmentArchived,
  updateInvestment,
} from './api'

export function useInvestments() {
  const { householdId } = useHouseholdId()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // `loading` cubre solo la primera carga y los reintentos: las recargas
  // después de guardar actualizan la lista sin reemplazarla por "Cargando…".
  const refresh = useCallback(async () => {
    try {
      setInvestments(await listInvestments())
      setError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Falso positivo del linter: refresh es async y su primer setState llega
    // después del await, no de forma síncrona dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  const retry = useCallback(() => {
    setLoading(true)
    setError(false)
    refresh()
  }, [refresh])

  async function create(input: InvestmentInput) {
    if (!householdId) return
    await createInvestment(householdId, input)
    await refresh()
  }

  async function update(id: string, input: InvestmentInput) {
    await updateInvestment(id, input)
    await refresh()
  }

  async function toggleArchived(id: string, archived: boolean) {
    await setInvestmentArchived(id, archived)
    await refresh()
  }

  async function remove(id: string) {
    await deleteInvestment(id)
    await refresh()
  }

  return { investments, loading, error, retry, create, update, toggleArchived, remove }
}
