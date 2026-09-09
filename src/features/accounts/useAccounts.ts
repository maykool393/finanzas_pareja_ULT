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

  const refresh = useCallback(async () => {
    setLoading(true)
    setAccounts(await listAccounts())
    setLoading(false)
  }, [])

  useEffect(() => {
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

  return { accounts, loading, create, update, toggleArchived, remove }
}
