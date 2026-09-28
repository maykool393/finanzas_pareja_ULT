import { useEffect } from 'react'

/** Superficies que pueden quedar pegadas arriba de una pantalla. */
type TopSurface = '--surface-page' | '--surface-card' | '--surface-header'

function applyThemeColor(token: TopSurface) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  if (!color) return
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = color
  })
}

/**
 * La barra del navegador y la de estado del celular toman el color de lo que
 * queda pegado arriba en la pantalla (DESIGN.md § Superficies del navegador).
 * Cada layout declara su superficie. El color se lee del CSS en vez de
 * repetirlo aquí, y se vuelve a leer cuando cambia el tema: a mano
 * ([data-theme]) o del sistema (prefers-color-scheme).
 */
export function useThemeColor(token: TopSurface) {
  useEffect(() => {
    const apply = () => applyThemeColor(token)
    apply()

    const observer = new MutationObserver(apply)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.addEventListener('change', apply)

    return () => {
      observer.disconnect()
      systemDark.removeEventListener('change', apply)
    }
  }, [token])
}
