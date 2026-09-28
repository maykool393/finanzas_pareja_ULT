import { Link, useNavigate } from 'react-router-dom'
import { FloatingButton } from '../components/ui/FloatingButton'
import { HomeIcon, PlusIcon } from '../components/ui/icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './Resumen.module.css'

/**
 * Inicio de la app. Las historias del mes (DESIGN.md § Resumen) llegan en R7;
 * mientras tanto, la pantalla dice qué va a haber y dónde está hoy lo más
 * parecido: el patrimonio.
 */
export function Resumen() {
  useDocumentTitle('Resumen')
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      {/* La cabecera ya dice "Nuestro resumen": el título queda para lectores de pantalla. */}
      <h1 className="visually-hidden">Resumen</h1>

      <div className={styles.empty}>
        <span className={styles.icon}>
          <HomeIcon aria-hidden="true" />
        </span>
        <p className={styles.emptyTitle}>El resumen del mes está en camino</p>
        <p className={styles.emptyText}>
          Aquí vas a ver cómo va el mes: ingresos y gastos, los gastos compartidos y los presupuestos.
          Mientras tanto, el total de cuentas, deudas e inversiones está en Patrimonio.
        </p>
        <Link to="/patrimonio" className={styles.link}>
          Ir a Patrimonio
        </Link>
      </div>

      <FloatingButton label="Añadir movimiento" icon={<PlusIcon />} onClick={() => navigate('/movimientos?nuevo=1')} />
    </div>
  )
}
