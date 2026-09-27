import styles from './Skeleton.module.css'

/**
 * Siluetas con la forma del contenido que está cargando, en vez del texto
 * "Cargando…": ocupan el mismo alto, así la página no salta cuando llegan los
 * datos. Son estáticas (sin brillo animado): la carga suele durar menos de un
 * segundo y un brillo en bucle sería movimiento sin información.
 */

/** Tarjetas de cuenta, deuda o inversión (mismo alto que ItemCard). */
export function SkeletonCards({ count = 2 }: { count?: number }) {
  return (
    <div className={styles.cards} aria-busy="true">
      <span className="visually-hidden">Cargando…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.card} aria-hidden="true" />
      ))}
    </div>
  )
}

/** Filas de una lista (movimientos, presupuestos, categorías). */
export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.rows} aria-busy="true">
      <span className="visually-hidden">Cargando…</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.row} aria-hidden="true" />
      ))}
    </div>
  )
}
