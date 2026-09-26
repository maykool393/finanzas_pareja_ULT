import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import styles from '../components/auth/RequireAuth.module.css'
import { useSession } from '../hooks/useSession'
import { setPendingInvite } from '../lib/pendingInvite'

/**
 * Destino del link/QR de invitación (/unirse/:householdId). Guarda el id
 * pendiente y redirige: con sesión sigue a /dashboard (RequireHousehold
 * hace la unión real); sin sesión, a registrarse. También es el destino de
 * vuelta tras confirmar el correo (ver emailRedirectTo en Login.tsx), por
 * eso el id se re-guarda aquí siempre, incluso si ya estaba.
 */
export function JoinRedirect() {
  const { householdId } = useParams<{ householdId: string }>()
  const { session, loading } = useSession()

  useEffect(() => {
    if (householdId) setPendingInvite(householdId)
  }, [householdId])

  if (!householdId) return <Navigate to="/" replace />
  if (loading) return <div className={styles.splash} aria-busy="true" />

  return <Navigate to={session ? '/dashboard' : '/registro'} replace />
}
