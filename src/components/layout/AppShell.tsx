import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useHouseholdMembers } from '../../hooks/useHouseholdMembers'
import { supabase } from '../../lib/supabase'
import { useThemeColor } from '../../hooks/useThemeColor'
import { HouseholdAvatars } from '../ui/HouseholdAvatars'
import { BarChartIcon, CardIcon, GridDotsIcon, HomeIcon, SwapIcon } from '../ui/icons'
import { Logo } from '../ui/Logo'
import { ThemeToggle } from '../ui/ThemeToggle'
import styles from './AppShell.module.css'

/** Las cinco pestañas (DESIGN.md § Estructura de la app). */
const NAV = [
  { to: '/resumen', label: 'Resumen', Icon: HomeIcon },
  { to: '/patrimonio', label: 'Patrimonio', Icon: BarChartIcon },
  { to: '/presupuesto', label: 'Presupuesto', Icon: CardIcon },
  { to: '/movimientos', label: 'Movimientos', Icon: SwapIcon },
  // Sus subpantallas también marcan la pestaña: son parte de "Ver más".
  { to: '/mas', label: 'Ver más', Icon: GridDotsIcon, also: ['/categorias', '/ajustes', '/invitar'] },
]

function tabActive(isActive: boolean, pathname: string, also?: string[]) {
  return isActive || (also?.includes(pathname) ?? false)
}

/** Título de la cabecera: [en pareja, de una persona]. Las subpantallas de "Ver más" dicen "Ver más". */
const VIEW_TITLES: Record<string, [string, string]> = {
  '/resumen': ['Nuestro resumen', 'Mi resumen'],
  '/patrimonio': ['Nuestro patrimonio', 'Mi patrimonio'],
  '/presupuesto': ['Nuestro presupuesto', 'Mi presupuesto'],
  '/movimientos': ['Nuestros movimientos', 'Mis movimientos'],
}

export function AppShell({ children }: { children: ReactNode }) {
  // La cabecera azul marino queda pegada arriba: la barra del celular toma su color.
  useThemeColor('--surface-header')
  const { pathname } = useLocation()
  const { members } = useHouseholdMembers()
  const titles = VIEW_TITLES[pathname]
  const viewTitle = titles ? titles[members.length >= 2 ? 0 : 1] : 'Ver más'

  return (
    <div className={styles.shell}>
      {/* Primer elemento con Tab: evita recorrer la cabecera en cada pantalla.
          Invisible hasta recibir el foco. */}
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Logo className={styles.brand} />

          {/* Solo un título por ahora (DESIGN.md: sin menú ni chevron). */}
          <p className={styles.viewTitle}>
            <HouseholdAvatars members={members} ownerId={null} size={24} ring="var(--surface-header)" />
            <span>{viewTitle}</span>
          </p>

          {/* Misma etiqueta que la barra inferior: nunca se ven las dos a la vez (display: none). */}
          <nav className={styles.nav} aria-label="Navegación principal">
            {NAV.map(({ to, label, also }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  tabActive(isActive, pathname, also) ? `${styles.link} ${styles.linkActive}` : styles.link
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <ThemeToggle />

          {/* Solo en escritorio, donde hay lugar; en móvil está al final de "Ver más". */}
          <button type="button" className={styles.signOut} onClick={() => supabase.auth.signOut()}>
            Salir
          </button>
        </div>
      </header>

      {/* tabIndex -1: el enlace de arriba le pasa el foco, sin sumarlo al orden de Tab. */}
      <main id="contenido" tabIndex={-1} className={styles.main}>
        {children}
      </main>

      <nav className={styles.tabBar} aria-label="Navegación principal">
        {NAV.map(({ to, label, Icon, also }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (tabActive(isActive, pathname, also) ? `${styles.tab} ${styles.tabActive}` : styles.tab)}
          >
            <Icon className={styles.tabIcon} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
