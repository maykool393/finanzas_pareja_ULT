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
  const [error, setError] = useState(false)

  // `loading` cubre solo la primera carga y los reintentos: las recargas
  // después de guardar actualizan la lista sin reemplazarla por "Cargando…".
  const refresh = useCallback(async () => {
    try {
      setCategories(await listCategories())
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

  return { categories, loading, error, retry, create, update, toggleArchived, remove }
}
