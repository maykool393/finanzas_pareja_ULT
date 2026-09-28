import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ChevronRightIcon, LogoutIcon } from '../components/ui/icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './More.module.css'

// Cada módulo que sume una pantalla de gestión agrega su enlace aquí.
const LINKS = [
  { to: '/ajustes', label: 'Ajustes del hogar' },
  { to: '/invitar', label: 'Invitar a tu pareja' },
  { to: '/categorias', label: 'Categorías' },
]

export function More() {
  useDocumentTitle('Ver más')

  return (
    <div>
      <h1 className={styles.title}>Ver más</h1>
      <nav className={styles.list} aria-label="Más secciones">
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to} className={styles.link}>
            {label}
            <ChevronRightIcon className={styles.chevron} aria-hidden="true" />
          </Link>
        ))}
      </nav>

      {/* Una fila más, visible, y no un texto al final: antes no se encontraba.
          En móvil es el único lugar para salir (la cabecera lleva el título y el tema). */}
      <button type="button" className={`${styles.link} ${styles.signOut}`} onClick={() => supabase.auth.signOut()}>
        Cerrar sesión
        <LogoutIcon className={styles.chevron} aria-hidden="true" />
      </button>
    </div>
  )
}
