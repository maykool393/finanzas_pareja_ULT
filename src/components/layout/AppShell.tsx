import { type CSSProperties, type ReactNode, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useHouseholdMembers } from '../../hooks/useHouseholdMembers'
import { supabase } from '../../lib/supabase'
import { useThemeColor } from '../../hooks/useThemeColor'
import { HouseholdAvatars } from '../ui/HouseholdAvatars'
import { BarChartIcon, CardIcon, GridDotsIcon, HomeIcon, SwapIcon } from '../ui/icons'
import { Logo } from '../ui/Logo'
import { ThemeToggle } from '../ui/ThemeToggle'
import styles from './AppShell.module.css'
import { HeaderSlotContext } from './headerSlot'

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

/** Pantallas que en móvil llenan todo el alto entre la cabecera y la barra inferior, sin relleno. */
const FULL_BLEED = new Set(['/resumen'])

export function AppShell({ children }: { children: ReactNode }) {
  // La cabecera azul marino queda pegada arriba: la barra del celular toma su color.
  useThemeColor('--surface-header')
  const { pathname } = useLocation()
  const { members } = useHouseholdMembers()
  const titles = VIEW_TITLES[pathname]
  const viewTitle = titles ? titles[members.length >= 2 ? 0 : 1] : 'Ver más'

  // Lugar de la cabecera para el contenido de cada pantalla (HeaderExtension).
  const [slot, setSlot] = useState<HTMLDivElement | null>(null)

  // Alto de la cabecera pegada arriba: lo usan los títulos y tarjetas que se
  // apilan al hacer scroll en Patrimonio, para quedar justo debajo de ella.
  const [header, setHeader] = useState<HTMLElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  useEffect(() => {
    if (!header) return
    const observer = new ResizeObserver(() => setHeaderHeight(header.offsetHeight))
    observer.observe(header)
    return () => observer.disconnect()
  }, [header])

  return (
    <div className={styles.shell} style={{ '--app-header-height': `${headerHeight}px` } as CSSProperties}>
      {/* Primer elemento con Tab: evita recorrer la cabecera en cada pantalla.
          Invisible hasta recibir el foco. */}
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <header className={styles.header} ref={setHeader}>
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
        <div ref={setSlot} className={styles.headerExtra} />
      </header>

      {/* tabIndex -1: el enlace de arriba le pasa el foco, sin sumarlo al orden de Tab. */}
      <main
        id="contenido"
        tabIndex={-1}
        className={FULL_BLEED.has(pathname) ? `${styles.main} ${styles.mainBleed}` : styles.main}
      >
        <HeaderSlotContext.Provider value={slot}>{children}</HeaderSlotContext.Provider>
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
