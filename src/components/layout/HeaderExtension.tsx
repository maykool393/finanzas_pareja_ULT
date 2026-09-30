import { type ReactNode, useContext } from 'react'
import { createPortal } from 'react-dom'
import { HeaderSlotContext } from './headerSlot'

/**
 * Pone su contenido dentro de la cabecera azul marino, debajo del título
 * (DESIGN.md § Estructura de la app): el total de Patrimonio, el mes del
 * Resumen. Hereda de la cabecera el texto blanco y el anillo de foco blanco.
 */
export function HeaderExtension({ children }: { children: ReactNode }) {
  const slot = useContext(HeaderSlotContext)
  return slot ? createPortal(children, slot) : null
}
