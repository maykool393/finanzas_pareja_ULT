import { useTheme } from '../../hooks/useTheme'
import { IconButton } from './IconButton'
import { MoonIcon, SunIcon } from './icons'

/**
 * Cambio de tema: el botón redondo de la derecha de la cabecera (DESIGN.md §
 * Estructura de la app), a mano desde cualquier pantalla principal.
 */
export function ThemeToggle({ tone = 'onHeader' }: { tone?: 'default' | 'onHeader' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <IconButton
      // Etiqueta fija con aria-pressed: el estado lo da "activado". Una etiqueta que
      // cambiaba ("Cambiar a modo claro") se anunciaba "…, activado", contradictorio.
      label="Modo oscuro"
      aria-pressed={isDark}
      icon={isDark ? <SunIcon /> : <MoonIcon />}
      size={34}
      tone={tone}
      onClick={toggle}
    />
  )
}
