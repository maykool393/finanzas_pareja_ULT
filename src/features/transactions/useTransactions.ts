import { useCallback, useEffect, useRef, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import { useSession } from '../../hooks/useSession'
import type { Transaction, TransactionFilters } from '../../types/domain'
import { refreshAccounts } from '../accounts/useAccounts'
import {
  type TransactionInput,
  createTransaction,
  deleteTransaction,
  listTransactions,
  listTransactionsPage,
  updateTransaction,
} from './api'

/**
 * Movimientos por páginas, del más nuevo al más antiguo. Antes se pedía todo
 * el historial de una vez: el dashboard lo descargaba entero para mostrar 5, y
 * pasadas las 1000 filas (el tope de la API) la lista perdía las más antiguas
 * sin avisar.
 */
export function useTransactions(filters: TransactionFilters = {}, { pageSize = 50 }: { pageSize?: number } = {}) {
  const { householdId } = useHouseholdId()
  const { user } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)

  // Cuántas filas hay cargadas: al recargar después de guardar se piden las
  // mismas, para no cerrar las páginas que el usuario ya abrió.
  const loadedCount = useRef(pageSize)
  // Solo la respuesta del último pedido se aplica: si cambian los filtros
  // mientras uno está en vuelo, su respuesta llega tarde y se descarta.
  const lastRequest = useRef(0)

  const filtersKey = JSON.stringify(filters)

  // `loading` cubre solo la primera carga y los reintentos: las recargas
  // después de guardar actualizan la lista sin reemplazarla por "Cargando…".
  const load = useCallback(
    async (count: number) => {
      const request = ++lastRequest.current
      try {
        // Una fila de más para saber si hay otra página, sin pedir un conteo aparte.
        const rows = await listTransactions(filters, count + 1)
        if (request !== lastRequest.current) return
        loadedCount.current = count
        setTransactions(rows.slice(0, count))
        setHasMore(rows.length > count)
        setError(false)
      } catch (err) {
        if (request !== lastRequest.current) return
        console.error(err)
        setError(true)
      } finally {
        if (request === lastRequest.current) setLoading(false)
      }
    },
    // filtersKey (no filters) a propósito: filters puede llegar como objeto
    // nuevo en cada render del caller, filtersKey lo estabiliza.
    [filtersKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    // Falso positivo del linter: load es async y su primer setState llega
    // después del await, no de forma síncrona dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(pageSize)
  }, [load, pageSize])

  const refresh = useCallback(() => load(Math.max(pageSize, loadedCount.current)), [load, pageSize])

  const retry = useCallback(() => {
    setLoading(true)
    setError(false)
    load(pageSize)
  }, [load, pageSize])

  /** Agrega la página siguiente al final de la lista. */
  async function loadMore() {
    setLoadingMore(true)
    setLoadMoreError(false)
    const request = lastRequest.current
    try {
      const rows = await listTransactionsPage(filters, transactions.length, pageSize + 1)
      if (request !== lastRequest.current) return
      const page = rows.slice(0, pageSize)
      // Si alguien agregó un movimiento entre medio, la página se corre una
      // fila: se descartan las que ya están para no mostrarlas dos veces.
      const known = new Set(transactions.map((t) => t.id))
      const next = [...transactions, ...page.filter((t) => !known.has(t.id))]
      loadedCount.current = next.length
      setTransactions(next)
      setHasMore(rows.length > pageSize)
    } catch (err) {
      console.error(err)
      setLoadMoreError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  async function create(input: TransactionInput) {
    if (!householdId || !user) return
    await createTransaction(householdId, user.id, input)
    await Promise.all([refresh(), refreshAccounts()])
  }

  async function update(id: string, input: TransactionInput) {
    await updateTransaction(id, input)
    await Promise.all([refresh(), refreshAccounts()])
  }

  async function remove(id: string) {
    await deleteTransaction(id)
    await Promise.all([refresh(), refreshAccounts()])
  }

  return { transactions, hasMore, loading, error, retry, loadMore, loadingMore, loadMoreError, create, update, remove }
}
