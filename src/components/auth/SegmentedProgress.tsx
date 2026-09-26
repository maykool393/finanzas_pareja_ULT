import { ProgressBar } from '../ui/ProgressBar'
import styles from './SegmentedProgress.module.css'

interface SegmentedProgressProps {
  /** Paso actual, 1-indexado. */
  step: number
  total: number
}

/** Barra de progreso por pasos — ver DESIGN.md § Barra de progreso por pasos (onboarding). */
export function SegmentedProgress({ step, total }: SegmentedProgressProps) {
  return (
    <div className={styles.row} role="group" aria-label={`Paso ${step} de ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <div className={styles.segment} key={index}>
          <ProgressBar
            ratio={index < step ? 1 : 0}
            trackColor="rgba(26, 26, 26, 0.18)"
            fillColor="var(--gradient-brand-dark)"
          />
        </div>
      ))}
    </div>
  )
}
