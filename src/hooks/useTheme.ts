import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function storedTheme(): Theme | null {
  const value = localStorage.getItem('theme')
  return value === 'light' || value === 'dark' ? value : null
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
  }, [choice])

  const systemDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme: Theme = choice ?? (systemDark ? 'dark' : 'light')

  const toggle = () => setChoice(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
