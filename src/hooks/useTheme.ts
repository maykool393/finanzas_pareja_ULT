import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

/** --surface-card de cada modo. Tiene que coincidir con los <meta name="theme-color"> de index.html. */
const THEME_COLORS: Record<Theme, string> = { light: '#FAFAFA', dark: '#1e1e1e' }

function storedTheme(): Theme | null {
  const value = localStorage.getItem('theme')
  return value === 'light' || value === 'dark' ? value : null
}

/**
 * La barra del navegador sigue al tema. index.html trae un <meta> por modo del
 * sistema; con un tema elegido a mano, los dos toman su color. Al volver a
 * seguir al sistema, cada uno recupera el de su modo.
 */
function syncThemeColor(choice: Theme | null) {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const own: Theme = meta.media.includes('dark') ? 'dark' : 'light'
    meta.content = THEME_COLORS[choice ?? own]
  })
}

/** Preferencia explícita del usuario (persistida) sobre el tema; null = sigue al sistema. */
export function useTheme() {
  const [choice, setChoice] = useState<Theme | null>(() => storedTheme())

  useEffect(() => {
    if (choice) {
      document.documentElement.dataset.theme = choice
      localStorage.setItem('theme', choice)
    } else {
      delete document.documentElement.dataset.theme
      localStorage.removeItem('theme')
    }
    syncThemeColor(choice)
  }, [choice])

  const systemDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme: Theme = choice ?? (systemDark ? 'dark' : 'light')

  const toggle = () => setChoice(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
