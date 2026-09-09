import { useCallback, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import type { Category } from '../../types/domain'
import {
  type CategoryInput,
  createCategory,
  deleteCategory,
  listCategories,
  setCategoryArchived,
  updateCategory,
} from './api'

export function useCategories() {
  const { householdId } = useHouseholdId()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setCategories(await listCategories())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

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

  return { categories, loading, create, update, toggleArchived, remove }
}
