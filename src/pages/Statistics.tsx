import { Link } from 'react-router-dom'
import { BarChartIcon } from '../components/ui/icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './Statistics.module.css'

/**
 * La pestaña ya está en la navegación, pero la pantalla todavía no existe.
 * En vez de dejarla vacía, dice qué va a haber y dónde está hoy lo más
 * parecido: los gráficos del mes en Finanzas.
 */
export function Statistics() {
  useDocumentTitle('Estadísticas')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Estadísticas</h1>

      <div className={styles.empty}>
        <span className={styles.icon}>
          <BarChartIcon aria-hidden="true" />
        </span>
        <p className={styles.emptyTitle}>Todavía no está disponible</p>
        <p className={styles.emptyText}>
          Aquí vas a poder ver cómo cambian tus gastos e ingresos en el tiempo. Mientras tanto, los gráficos
          de los últimos meses están en Finanzas.
        </p>
        <Link to="/dashboard" className={styles.link}>
          Ir a Finanzas
        </Link>
      </div>
    </div>
  )
}
