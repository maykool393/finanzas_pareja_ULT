import { useCallback, useState } from 'react'

/**
 * Corre una acción que puede fallar (guardar, eliminar, archivar) y deja su
 * estado listo para la interfaz: `pending` mientras corre y un mensaje si
 * falla. El error no se propaga: la pantalla lo muestra en línea, el botón se
 * libera y se puede reintentar. Antes, un fallo dejaba el botón en
 * "Guardando…" para siempre.
 */
export function useAsyncAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (action: () => Promise<void>, errorMessage: string) => {
    setPending(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      console.error(err)
      setError(errorMessage)
    } finally {
      setPending(false)
    }
  }, [])

  const reset = useCallback(() => setError(null), [])

  return { pending, error, run, reset }
}
