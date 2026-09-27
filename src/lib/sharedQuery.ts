import { useEffect, useSyncExternalStore } from 'react'
import { supabase } from './supabase'

interface Snapshot<T> {
  data: T
  /** Solo la primera carga y los reintentos; las recargas tras guardar no lo encienden. */
  loading: boolean
  error: boolean
}

/**
 * Datos que muchas pantallas y formularios necesitan a la vez (el hogar, las
 * cuentas, las categorías, los miembros), guardados una sola vez para toda la
 * app. Antes cada componente los pedía por su cuenta: abrir el dashboard
 * disparaba unas 8 consultas del mismo perfil, cada formulario volvía a pedir
 * cuentas y categorías al abrirse, y guardar en un lugar no actualizaba los
 * demás.
 */
export interface SharedQuery<T> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => Snapshot<T>
  /** Carga si nunca cargó, si falló o si los datos tienen más de `staleMs`. No repite un pedido en vuelo. */
  ensure: () => void
  /** Vuelve a pedir siempre (después de guardar). Solo se aplica la respuesta del último pedido. */
  refresh: () => Promise<void>
  /** Como refresh, mostrando "Cargando…" (botón Reintentar). */
  retry: () => void
}

const everyQuery: { reset: () => void }[] = []

export function createSharedQuery<T>(load: () => Promise<T>, initial: T, staleMs = 30_000): SharedQuery<T> {
  let snapshot: Snapshot<T> = { data: initial, loading: true, error: false }
  let loadedAt = 0
  let latest = 0
  let inFlight: Promise<void> | null = null
  const listeners = new Set<() => void>()

  function set(next: Partial<Snapshot<T>>) {
    snapshot = { ...snapshot, ...next }
    listeners.forEach((listener) => listener())
  }

  function refresh() {
    const request = ++latest
    const promise = load().then(
      (data) => {
        if (request !== latest) return
        loadedAt = Date.now()
        set({ data, loading: false, error: false })
      },
      (err) => {
        if (request !== latest) return
        console.error(err)
        set({ loading: false, error: true })
      },
    )
    inFlight = promise.finally(() => {
      if (request === latest) inFlight = null
    })
    return inFlight
  }

  const query: SharedQuery<T> = {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => snapshot,
    ensure() {
      if (inFlight) return
      if (!snapshot.error && loadedAt > 0 && Date.now() - loadedAt < staleMs) return
      refresh()
    },
    refresh,
    retry() {
      set({ loading: true, error: false })
      refresh()
    },
  }

  everyQuery.push({
    reset() {
      latest++ // la respuesta de un pedido en vuelo ya no se aplica
      inFlight = null
      loadedAt = 0
      set({ data: initial, loading: true, error: false })
    },
  })

  return query
}

/** Lee una consulta compartida y la carga si hace falta. */
export function useSharedQuery<T>(query: SharedQuery<T>): Snapshot<T> {
  const snapshot = useSyncExternalStore(query.subscribe, query.getSnapshot)
  useEffect(() => {
    query.ensure()
  }, [query])
  return snapshot
}

// Al cambiar de usuario (cerrar sesión, entrar con otra cuenta) se borra todo:
// si no, la cuenta nueva vería por un momento los datos de la anterior.
let currentUserId: string | null | undefined
supabase.auth.onAuthStateChange((_event, session) => {
  const userId = session?.user.id ?? null
  if (currentUserId !== undefined && userId !== currentUserId) {
    everyQuery.forEach((query) => query.reset())
  }
  currentUserId = userId
})
