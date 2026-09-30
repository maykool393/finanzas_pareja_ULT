import { useHouseholdId } from '../../hooks/useHouseholdId'
import { createSharedQuery, useSharedQuery } from '../../lib/sharedQuery'
import type { InvestmentGroup } from '../../types/domain'
import {
  createInvestmentGroup,
  deleteInvestmentGroup,
  type InvestmentGroupInput,
  listInvestmentGroups,
  updateInvestmentGroup,
} from './api'

/**
 * Si no se pueden leer (por ejemplo, antes de correr la migración
 * 20260930192842), la lista de inversiones sigue funcionando sin grupos:
 * todas van en "Otras". El error va a la consola.
 */
const groupsQuery = createSharedQuery<InvestmentGroup[]>(async () => {
  try {
    return await listInvestmentGroups()
  } catch (err) {
    console.error(err)
    return []
  }
}, [])

/** Grupos de inversiones del hogar, compartidos por la lista y el formulario. */
export function useInvestmentGroups() {
  const { householdId } = useHouseholdId()
  const { data: groups } = useSharedQuery(groupsQuery)

  async function create(input: InvestmentGroupInput): Promise<InvestmentGroup | null> {
    if (!householdId) return null
    const group = await createInvestmentGroup(householdId, input)
    await groupsQuery.refresh()
    return group
  }

  async function update(id: string, input: InvestmentGroupInput) {
    await updateInvestmentGroup(id, input)
    await groupsQuery.refresh()
  }

  async function remove(id: string) {
    await deleteInvestmentGroup(id)
    await groupsQuery.refresh()
  }

  return { groups, create, update, remove, refresh: groupsQuery.refresh }
}
