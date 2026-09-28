import type { ReactNode } from 'react'
import { useThemeColor } from '../../hooks/useThemeColor'
import { AvatarPair } from './AvatarPair'
import styles from './OnboardingLayout.module.css'
import { SegmentedProgress } from './SegmentedProgress'

interface OnboardingLayoutProps {
  step: number
  total: number
  titleLine1: string
  titleLine2: string
  children: ReactNode
}

/**
 * Layout de flujos de varios pasos "en pareja" (ver DESIGN.md § Onboarding).
 * Distinto de AuthLayout: ese es para Login/recuperar contraseña/crear cuenta.
 */
export function OnboardingLayout({ step, total, titleLine1, titleLine2, children }: OnboardingLayoutProps) {
  useThemeColor('--surface-page')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <SegmentedProgress step={step} total={total} />

        <div className={styles.title}>
          <div>{titleLine1}</div>
          <div className={styles.titleAccent}>{titleLine2}</div>
        </div>

        <AvatarPair />
      </div>

      <div className={styles.sheet}>{children}</div>
    </div>
  )
}
