import { useCallback, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import type { Account } from '../../types/domain'
import {
  type AccountInput,
  createAccount,
  deleteAccount,
  listAccounts,
  setAccountArchived,
  updateAccount,
} from './api'

export function useAccounts() {
  const { householdId } = useHouseholdId()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // `loading` cubre solo la primera carga y los reintentos: las recargas
  // después de guardar actualizan la lista sin reemplazarla por "Cargando…".
  const refresh = useCallback(async () => {
    try {
      setAccounts(await listAccounts())
      setError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const retry = useCallback(() => {
    setLoading(true)
    setError(false)
    refresh()
  }, [refresh])

  async function create(input: AccountInput, initialBalance: number) {
    if (!householdId) return
    await createAccount(householdId, input, initialBalance)
    await refresh()
  }

  async function update(id: string, input: AccountInput) {
    await updateAccount(id, input)
    await refresh()
  }

  async function toggleArchived(id: string, archived: boolean) {
    await setAccountArchived(id, archived)
    await refresh()
  }

  async function remove(id: string) {
    await deleteAccount(id)
    await refresh()
  }

  return { accounts, loading, error, retry, create, update, toggleArchived, remove }
}
