import { useCallback, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import type { Debt } from '../../types/domain'
import { type DebtInput, createDebt, deleteDebt, listDebts, setDebtArchived, updateDebt } from './api'

export function useDebts() {
  const { householdId } = useHouseholdId()
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setDebts(await listDebts())
    setLoading(false)
  }, [])

  useEffect(() => {
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

  return { debts, loading, create, update, toggleArchived, remove }
}
