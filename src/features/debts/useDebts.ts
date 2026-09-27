import { useCallback, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import type { Debt } from '../../types/domain'
import { type DebtInput, createDebt, deleteDebt, listDebts, setDebtArchived, updateDebt } from './api'

export function useDebts() {
  const { householdId } = useHouseholdId()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // `loading` cubre solo la primera carga y los reintentos: las recargas
  // después de guardar actualizan la lista sin reemplazarla por "Cargando…".
  const refresh = useCallback(async () => {
    try {
      setDebts(await listDebts())
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

  async function create(input: DebtInput) {
    if (!householdId) return
    await createDebt(householdId, input)
    await refresh()
  }

  async function update(id: string, input: DebtInput) {
    await updateDebt(id, input)
    await refresh()
  }

  async function toggleArchived(id: string, archived: boolean) {
    await setDebtArchived(id, archived)
    await refresh()
  }

  async function remove(id: string) {
    await deleteDebt(id)
    await refresh()
  }

  return { debts, loading, error, retry, create, update, toggleArchived, remove }
}
