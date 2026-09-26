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
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <img src="/logo.svg" alt="Twoney" className={styles.brand} />
          <nav className={styles.nav}>
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

      <main className={styles.main}>{children}</main>

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
