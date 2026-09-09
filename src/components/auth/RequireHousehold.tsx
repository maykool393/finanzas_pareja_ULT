import type { ReactNode } from 'react'
import { useHouseholdId } from '../../hooks/useHouseholdId'
import { HouseholdSetup } from '../../pages/HouseholdSetup'
import styles from './RequireAuth.module.css'

/**
 * Se monta detrás de RequireAuth. Sin household_id ningún módulo funciona
 * (todas las tablas dependen de él) — antes de mostrar el AppShell, exige
 * crear un household o unirse a uno con un código.
 */
export function RequireHousehold({ children }: { children: ReactNode }) {
  const { householdId, loading, refresh } = useHouseholdId()

  if (loading) {
    return <div className={styles.splash} aria-busy="true" />
  }

  if (!householdId) {
    return <HouseholdSetup onDone={refresh} />
  }

  return <>{children}</>
}
