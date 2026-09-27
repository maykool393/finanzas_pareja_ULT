import { useEffect } from 'react'

const APP_NAME = 'Twoney'

/**
 * Título de la pestaña del navegador por pantalla: "Movimientos · Twoney".
 * Antes era siempre "Twoney": dos pestañas abiertas no se distinguían, y al
 * cambiar de pantalla el lector de pantalla no tenía un título nuevo que
 * anunciar (WCAG 2.4.2). Sin título, solo el nombre de la app.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])
}
