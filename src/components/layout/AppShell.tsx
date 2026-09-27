import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { BarChartIcon, MoreIcon, PieChartIcon, SwapIcon, WalletIcon } from '../ui/icons'
import { ThemeToggle } from '../ui/ThemeToggle'
import { supabase } from '../../lib/supabase'
import styles from './AppShell.module.css'

const NAV = [
  { to: '/dashboard', label: 'Finanzas', end: true, Icon: WalletIcon },
  { to: '/presupuesto', label: 'Presupuesto', end: false, Icon: PieChartIcon },
  { to: '/mover', label: 'Mover', end: false, Icon: SwapIcon },
  { to: '/estadisticas', label: 'Estadísticas', end: false, Icon: BarChartIcon },
  { to: '/mas', label: 'Ver más', end: false, Icon: MoreIcon },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {/* Primer elemento con Tab: evita recorrer el encabezado (logo, 5 enlaces,
          tema y salir) en cada pantalla. Invisible hasta recibir el foco. */}
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <img src="/logo.svg" alt="Twoney" className={styles.brand} />
          {/* Misma etiqueta que la barra inferior: nunca se ven las dos a la vez (display: none). */}
          <nav className={styles.nav} aria-label="Navegación principal">
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.linkActive}` : styles.link
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.actions}>
            <ThemeToggle />
            <button type="button" className={styles.signOut} onClick={() => supabase.auth.signOut()}>
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* tabIndex -1: el enlace de arriba le pasa el foco, sin sumarlo al orden de Tab. */}
      <main id="contenido" tabIndex={-1} className={styles.main}>
        {children}
      </main>

      <nav className={styles.tabBar} aria-label="Navegación principal">
        {NAV.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab)}
          >
            <Icon className={styles.tabIcon} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
