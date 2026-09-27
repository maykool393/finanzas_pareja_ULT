import { useHouseholdId } from '../../hooks/useHouseholdId'
import { createSharedQuery, useSharedQuery } from '../../lib/sharedQuery'
import type { Account } from '../../types/domain'
import {
  type AccountInput,
  createAccount,
  deleteAccount,
  listAccounts,
  setAccountArchived,
  updateAccount,
} from './api'

/** Compartidas por toda la app (ver sharedQuery.ts): cada formulario que las usa ya no las vuelve a pedir. */
const accountsQuery = createSharedQuery<Account[]>(() => listAccounts(), [])

/**
 * Los saldos los mantiene la base con un trigger al guardar un movimiento: quien
 * crea, edita o borra uno llama a esto para que las cuentas no queden viejas.
 */
export function refreshAccounts() {
  return accountsQuery.refresh()
}

export function useAccounts() {
  const { householdId } = useHouseholdId()
  const { data: accounts, loading, error } = useSharedQuery(accountsQuery)
  const refresh = accountsQuery.refresh

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

  return { accounts, loading, error, retry: accountsQuery.retry, create, update, toggleArchived, remove }
}
