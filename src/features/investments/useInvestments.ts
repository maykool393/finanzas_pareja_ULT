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

  const refresh = useCallback(async () => {
    setLoading(true)
    setInvestments(await listInvestments())
    setLoading(false)
  }, [])

  useEffect(() => {
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

  return { investments, loading, create, update, toggleArchived, remove }
}
