import type { CSSProperties, ReactNode } from 'react'
import { useThemeColor } from '../../hooks/useThemeColor'
import { ChevronLeftIcon } from '../ui/icons'
import { Logo } from '../ui/Logo'
import styles from './OnboardingLayout.module.css'

interface OnboardingLayoutProps {
  /** Paso actual (1 = el primero) y total del recorrido. Sin él (pantalla final), no hay barra ni número. */
  progress?: { step: number; total: number }
  title: string
  helper?: string
  /** Si se pasa, aparece "Volver" arriba a la izquierda. */
  onBack?: () => void
  /** El botón principal del paso, a todo el ancho abajo. */
  footer: ReactNode
  /** La pantalla final centra su contenido y no lleva número de paso. */
  centered?: boolean
  /** Lo que va arriba del título (la ilustración de la pantalla final). */
  hero?: ReactNode
  children: ReactNode
}

/**
 * Estructura de cada paso del onboarding (DESIGN.md § Onboarding): fondo con
 * manchas, "Volver" + logo, línea de progreso con un punto, número de paso de
 * fondo, título con su ayuda, y el botón principal abajo.
 */
export function OnboardingLayout({ progress, title, helper, onBack, footer, centered, hero, children }: OnboardingLayoutProps) {
  useThemeColor('--surface-page')

  // Primer paso: el punto al inicio de la línea; último: al final.
  const ratio = progress && progress.total > 1 ? (progress.step - 1) / (progress.total - 1) : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.topRow}>
          {onBack ? (
            <button type="button" className={styles.back} onClick={onBack} aria-label="Volver">
              <ChevronLeftIcon />
            </button>
          ) : (
            <span className={styles.spacer} />
          )}
          <Logo className={styles.logo} />
          <span className={styles.spacer} />
        </div>

        {progress && (
          <div
            className={styles.track}
            style={{ '--progress': ratio } as CSSProperties}
            role="progressbar"
            aria-label="Progreso de la configuración"
            aria-valuemin={1}
            aria-valuemax={progress.total}
            aria-valuenow={progress.step}
            aria-valuetext={`Paso ${progress.step} de ${progress.total}`}
          >
            <span className={styles.dot} />
          </div>
        )}
      </header>

      <main className={centered ? `${styles.body} ${styles.centered}` : styles.body}>
        {progress && !centered && (
          <span className={styles.watermark} aria-hidden="true">
            {String(progress.step).padStart(2, '0')}
          </span>
        )}

        {hero}

        <div className={styles.intro}>
          <h1 className={styles.title}>{title}</h1>
          {helper && <p className={styles.helper}>{helper}</p>}
        </div>

        {children}
      </main>

      <footer className={styles.footer}>{footer}</footer>
    </div>
  )
}
