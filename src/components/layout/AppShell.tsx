import type { ReactNode, SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'
import { supabase } from '../../lib/supabase'
import styles from './AppShell.module.css'

function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="5" width="15" height="11" rx="2.5" />
      <path d="M2.5 8.5h15" />
      <path d="M13.5 12h2" />
    </svg>
  )
}

function PieChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 2.5A7.5 7.5 0 1 0 17.5 10H10Z" />
      <path d="M13 2.9A7.52 7.52 0 0 1 17.1 7H13Z" />
    </svg>
  )
}

function SwapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6.5h11.5M12.5 3.5l3 3-3 3" />
      <path d="M16 13.5H4.5m3 3-3-3 3-3" />
    </svg>
  )
}

function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 17V10M10 17V3M16 17v-6.5" />
    </svg>
  )
}

function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <circle cx="4.5" cy="10" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="15.5" cy="10" r="1.4" />
    </svg>
  )
}

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
          <img src="/logo.svg" alt="WeWallet" className={styles.brand} />
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
