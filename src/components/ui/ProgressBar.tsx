import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  ratio: number // 0–1, pagos completados / pagos totales
  trackColor: string
  fillColor: string
}

export function ProgressBar({ ratio, trackColor, fillColor }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, ratio))
  const percent = Math.round(clamped * 100)

  return (
    // <span> y no <div>: la barra va dentro de ItemCard, que es un <button>, y
    // un botón solo admite contenido en línea. El CSS los vuelve bloque.
    <span
      className={styles.track}
      style={{ background: trackColor }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Relleno de ancho completo desplazado a la izquierda: animar translateX
          no recalcula layout (como width) ni aplasta el extremo redondeado
          (como scaleX). El riel recorta lo que sobra. */}
      <span className={styles.fill} style={{ transform: `translateX(${(clamped - 1) * 100}%)`, background: fillColor }} />
    </span>
  )
}
