import { useTheme } from '../../hooks/useTheme'
import { MoonIcon, SunIcon } from './icons'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      // Etiqueta fija con aria-pressed: el estado lo da "activado". Una etiqueta que
      // cambiaba ("Cambiar a modo claro") se anunciaba "…, activado", contradictorio.
      aria-label="Modo oscuro"
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
