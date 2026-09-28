import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import styles from '../components/auth/RequireAuth.module.css'
import { useSession } from '../hooks/useSession'
import { setPendingInvite } from '../lib/pendingInvite'

/**
 * Destino del link/QR de invitación (/unirse/:code). Guarda el código
 * pendiente y redirige: con sesión sigue a /dashboard (RequireHousehold
 * hace la unión real); sin sesión, a registrarse. También es el destino de
 * vuelta tras confirmar el correo (ver emailRedirectTo en Login.tsx), por
 * eso el código se re-guarda aquí siempre, incluso si ya estaba.
 */
export function JoinRedirect() {
  const { code } = useParams<{ code: string }>()
  const { session, loading } = useSession()

  useEffect(() => {
    if (code) setPendingInvite(code)
  }, [code])

  if (!code) return <Navigate to="/" replace />
  if (loading) return <div className={styles.splash} aria-busy="true" />

  return <Navigate to={session ? '/dashboard' : '/registro'} replace />
}
