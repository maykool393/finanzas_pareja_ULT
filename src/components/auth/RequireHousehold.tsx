import { type ReactNode, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import { useSession } from '../../hooks/useSession'
import { joinHousehold } from '../../lib/inviteCode'
import { clearPendingInvite, getPendingInvite } from '../../lib/pendingInvite'
import { supabase } from '../../lib/supabase'
import { HouseholdSetup } from '../../pages/HouseholdSetup'
import { LoadError } from '../ui/LoadStatus'
import styles from './RequireAuth.module.css'

/**
 * Se monta detrás de RequireAuth. Sin household_id ningún módulo funciona
 * (todas las tablas dependen de él) — antes de mostrar el AppShell, exige
 * crear un household, unirse a uno con un código, o consumir una invitación
 * pendiente de un link/QR (ver JoinRedirect + lib/pendingInvite).
 */
export function RequireHousehold({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const { householdId, loading, error, refresh, retry } = useHouseholdId()
  // Si al montar hay una invitación pendiente (link/QR), se arranca "uniéndose":
  // el splash se ve desde el primer render, sin esperar al efecto.
  const [joiningInvite, setJoiningInvite] = useState(() => getPendingInvite() !== null)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || householdId || !user) return
    const pending = getPendingInvite()
    if (!pending) return

    let cancelled = false

    joinHousehold(pending).then((failure) => {
      clearPendingInvite()
      if (cancelled) return
      if (failure) {
        setJoinError(failure)
        setJoiningInvite(false)
        return
      }
      refresh().then(() => {
        if (!cancelled) setJoiningInvite(false)
      })
    })

    return () => {
      cancelled = true
    }
  }, [loading, householdId, user, refresh])

  // Con household, la invitación pendiente no aplica (no se consume): se sigue de largo.
  if (loading || (joiningInvite && !householdId)) {
    return <div className={styles.splash} aria-busy="true" />
  }

  // Sin esto, un fallo al pedir el perfil se leía como "no tiene hogar" y
  // mandaba al onboarding a quien ya tenía uno.
  if (error) {
    return (
      <div className={`${styles.splash} ${styles.centered}`}>
        <LoadError onRetry={retry} />
        <button type="button" className={styles.signOut} onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </button>
      </div>
    )
  }

  if (!householdId) {
    return <HouseholdSetup onDone={refresh} joinError={joinError} />
  }

  return <>{children}</>
}
