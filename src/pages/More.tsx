import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '../components/ui/icons'
import styles from './More.module.css'

// Cada módulo que sume una pantalla de gestión (Fases 1–4) agrega su enlace aquí.
const LINKS = [
  { to: '/invitar', label: 'Invitar a tu pareja' },
  { to: '/categorias', label: 'Categorías' },
]

export function More() {
  return (
    <div>
      <h1 className={styles.title}>Ver más</h1>
      <nav className={styles.list}>
        {LINKS.map(({ to, label }) => (
          <Link key={to} to={to} className={styles.link}>
            {label}
            <ChevronRightIcon className={styles.chevron} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </div>
  )
}
