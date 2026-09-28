import type { ColorOption } from '../../components/ui/ColorPicker'
import type { CategoryColor } from '../../types/domain'

/**
 * Las 4 familias de tono ya definidas en tokens.css — categorías nunca eligen
 * color libre. Las claves son las que guarda la base (no se renombran); el tono
 * y el nombre visible sí cambiaron: ver DESIGN.md § Tonos de tarjeta.
 *
 * - bg: `background` completo (en oscuro es un degradado en capas).
 * - solid: un solo color, para rellenos SVG donde no cabe un degradado.
 * - text: texto e íconos encima — siempre --text-primary.
 */
export const CATEGORY_COLOR_TOKENS: Record<CategoryColor, { bg: string; solid: string; text: string }> = {
  green: { bg: 'var(--tone-turquesa-bg)', solid: 'var(--tone-turquesa-solid)', text: 'var(--text-primary)' },
  purple: { bg: 'var(--tone-lavanda-bg)', solid: 'var(--tone-lavanda-solid)', text: 'var(--text-primary)' },
  coral: { bg: 'var(--tone-ambar-bg)', solid: 'var(--tone-ambar-solid)', text: 'var(--text-primary)' },
  pink: { bg: 'var(--tone-rosa-bg)', solid: 'var(--tone-rosa-solid)', text: 'var(--text-primary)' },
}

export const CATEGORY_COLOR_OPTIONS: ColorOption[] = [
  { key: 'green', label: 'Turquesa', swatch: CATEGORY_COLOR_TOKENS.green.bg },
  { key: 'purple', label: 'Lavanda', swatch: CATEGORY_COLOR_TOKENS.purple.bg },
  { key: 'coral', label: 'Ámbar', swatch: CATEGORY_COLOR_TOKENS.coral.bg },
  { key: 'pink', label: 'Rosa', swatch: CATEGORY_COLOR_TOKENS.pink.bg },
]
