import type { ColorOption } from '../../components/ui/ColorPicker'
import type { CategoryColor } from '../../types/domain'

/** Las 4 familias de tono ya definidas en tokens.css — categorías nunca eligen color libre. */
export const CATEGORY_COLOR_TOKENS: Record<CategoryColor, { bg: string; text: string }> = {
  green: { bg: 'var(--account-a-bg)', text: 'var(--account-a-text)' },
  purple: { bg: 'var(--account-b-bg)', text: 'var(--account-b-text)' },
  coral: { bg: 'var(--debt-a-bg)', text: 'var(--debt-a-text)' },
  pink: { bg: 'var(--debt-b-bg)', text: 'var(--debt-b-text)' },
}

export const CATEGORY_COLOR_OPTIONS: ColorOption[] = [
  { key: 'green', label: 'Verde', swatch: CATEGORY_COLOR_TOKENS.green.bg },
  { key: 'purple', label: 'Morado', swatch: CATEGORY_COLOR_TOKENS.purple.bg },
  { key: 'coral', label: 'Coral', swatch: CATEGORY_COLOR_TOKENS.coral.bg },
  { key: 'pink', label: 'Rosa', swatch: CATEGORY_COLOR_TOKENS.pink.bg },
]
