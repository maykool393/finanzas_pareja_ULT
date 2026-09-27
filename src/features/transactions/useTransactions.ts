import { useCallback, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import { useSession } from '../../hooks/useSession'
import type { Transaction, TransactionFilters } from '../../types/domain'
import {
  type TransactionInput,
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './api'

export function useTransactions(filters: TransactionFilters = {}) {
  const { householdId } = useHouseholdId()
  const { user } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const filtersKey = JSON.stringify(filters)

  // `loading` cubre solo la primera carga y los reintentos: las recargas
  // después de guardar actualizan la lista sin reemplazarla por "Cargando…".
  const refresh = useCallback(async () => {
    try {
      setTransactions(await listTransactions(filters))
      setError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
    // filtersKey (no filters) a propósito: filters puede llegar como objeto
    // nuevo en cada render del caller, filtersKey lo estabiliza.
  }, [filtersKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh()
  }, [refresh])

  const retry = useCallback(() => {
    setLoading(true)
    setError(false)
    refresh()
  }, [refresh])

  async function create(input: TransactionInput) {
    if (!householdId || !user) return
    await createTransaction(householdId, user.id, input)
    await refresh()
  }

  async function update(id: string, input: TransactionInput) {
    await updateTransaction(id, input)
    await refresh()
  }

  async function remove(id: string) {
    await deleteTransaction(id)
    await refresh()
  }

  return { transactions, loading, error, retry, create, update, remove }
}
