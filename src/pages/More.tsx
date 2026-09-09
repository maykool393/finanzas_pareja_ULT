import { Link } from 'react-router-dom'
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
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
              <path d="m8 5 5 5-5 5" />
            </svg>
          </Link>
        ))}
      </nav>
    </div>
  )
}
