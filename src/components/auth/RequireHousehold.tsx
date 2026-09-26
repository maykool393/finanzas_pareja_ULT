import { type ReactNode, useEffect, useState } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import { useSession } from '../../hooks/useSession'
import { clearPendingInvite, getPendingInvite } from '../../lib/pendingInvite'
import { supabase } from '../../lib/supabase'
import { HouseholdSetup } from '../../pages/HouseholdSetup'
import styles from './RequireAuth.module.css'

/**
 * Se monta detrás de RequireAuth. Sin household_id ningún módulo funciona
 * (todas las tablas dependen de él) — antes de mostrar el AppShell, exige
 * crear un household, unirse a uno con un código, o consumir una invitación
 * pendiente de un link/QR (ver JoinRedirect + lib/pendingInvite).
 */
export function RequireHousehold({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const { householdId, loading, refresh } = useHouseholdId()
  const [joiningInvite, setJoiningInvite] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || householdId || !user) return
    const pending = getPendingInvite()
    if (!pending) return

    let cancelled = false
    setJoiningInvite(true)

    supabase
      .from('profiles')
      .update({ household_id: pending })
      .eq('id', user.id)
      .then(({ error }) => {
        clearPendingInvite()
        if (cancelled) return
        if (error) {
          setJoinError('El código de invitación ya no es válido. Pídele a tu pareja que comparta uno nuevo.')
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

  if (loading || joiningInvite) {
    return <div className={styles.splash} aria-busy="true" />
  }

  if (!householdId) {
    return <HouseholdSetup onDone={refresh} joinError={joinError} />
  }

  return <>{children}</>
}
