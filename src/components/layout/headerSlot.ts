import { createContext } from 'react'

/**
 * El lugar de la cabecera azul marino donde una pantalla pone lo suyo (el
 * total de Patrimonio, el mes del Resumen). AppShell lo provee; las pantallas
 * lo usan con <HeaderExtension>. Aparte del componente: un archivo que exporta
 * componentes y objetos rompe el recargado en caliente de Vite.
 */
export const HeaderSlotContext = createContext<HTMLElement | null>(null)
