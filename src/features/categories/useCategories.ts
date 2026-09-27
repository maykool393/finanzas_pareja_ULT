import { useHouseholdId } from '../../hooks/useHouseholdId'
import { createSharedQuery, useSharedQuery } from '../../lib/sharedQuery'
import type { Category } from '../../types/domain'
import {
  type CategoryInput,
  createCategory,
  deleteCategory,
  listCategories,
  setCategoryArchived,
  updateCategory,
} from './api'

/** Compartidas por toda la app (ver sharedQuery.ts): cada formulario que las usa ya no las vuelve a pedir. */
const categoriesQuery = createSharedQuery<Category[]>(() => listCategories(), [])

export function useCategories() {
  const { householdId } = useHouseholdId()
  const { data: categories, loading, error } = useSharedQuery(categoriesQuery)
  const refresh = categoriesQuery.refresh

  async function create(input: CategoryInput) {
    if (!householdId) return
    await createCategory(householdId, input)
    await refresh()
  }

  async function update(id: string, input: CategoryInput) {
    await updateCategory(id, input)
    await refresh()
  }

  async function toggleArchived(id: string, archived: boolean) {
    await setCategoryArchived(id, archived)
    await refresh()
  }

  async function remove(id: string) {
    await deleteCategory(id)
    await refresh()
  }

  return { categories, loading, error, retry: categoriesQuery.retry, create, update, toggleArchived, remove }
}
