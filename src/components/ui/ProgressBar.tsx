import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  ratio: number // 0–1, pagos completados / pagos totales
  trackColor: string
  fillColor: string
}

export function ProgressBar({ ratio, trackColor, fillColor }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100)

  return (
    <div
      className={styles.track}
      style={{ background: trackColor }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${percent}%`, background: fillColor }} />
    </div>
  )
}
