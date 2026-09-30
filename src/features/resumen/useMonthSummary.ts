import { useCallback, useEffect, useRef, useState } from 'react'
import { endOfMonth } from '../../lib/month'
import type { Budget, Settlement, Transaction } from '../../types/domain'
import { listBudgets } from '../budgets/api'
import { listSettlements } from '../settlements/api'
import { listTransactions } from '../transactions/api'

export interface MonthData {
  transactions: Transaction[]
  budgets: Budget[]
  settlements: Settlement[]
}

interface State {
  month: string
  data: MonthData | null
  error: boolean
}

/**
 * Lo que las historias del Resumen necesitan de un mes ('YYYY-MM-01'): sus
 * movimientos completos (en bloques de 1000, ver listTransactions), sus
 * presupuestos y sus saldos. Las cuentas, los miembros y las categorías
 * vienen de sus consultas compartidas.
 */
export function useMonthSummary(month: string) {
  const [state, setState] = useState<State>({ month, data: null, error: false })
  // Solo la respuesta del último pedido se aplica: al pasar de mes rápido,
  // la de un mes anterior llega tarde y se descarta.
  const lastRequest = useRef(0)

  const load = useCallback(async (target: string) => {
    const request = ++lastRequest.current
    try {
      const [transactions, budgets, settlements] = await Promise.all([
        listTransactions({ from: target, to: endOfMonth(target) }),
        listBudgets(target),
        // Antes de correr la migración de R7 la tabla no existe: sin saldos.
        listSettlements(target).catch((err) => {
          console.error(err)
          return [] as Settlement[]
        }),
      ])
      if (request !== lastRequest.current) return
      setState({ month: target, data: { transactions, budgets, settlements }, error: false })
    } catch (err) {
      if (request !== lastRequest.current) return
      console.error(err)
      setState({ month: target, data: null, error: true })
    }
  }, [])

  useEffect(() => {
    // Falso positivo del linter: load es async y su primer setState llega
    // después del await, no de forma síncrona dentro del efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(month)
  }, [load, month])

  // Cargando: la primera vez y al cambiar de mes. Recargar después de saldar
  // deja los datos a la vista hasta que llegan los nuevos.
  const current = state.month === month
  const loading = !current || (state.data === null && !state.error)

  const retry = useCallback(() => {
    setState({ month, data: null, error: false })
    load(month)
  }, [load, month])

  const refresh = useCallback(() => load(month), [load, month])

  return { data: current ? state.data : null, loading, error: current && state.error, retry, refresh }
}
