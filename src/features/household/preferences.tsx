import { BoltIcon, ClockIcon, SlidersIcon } from '../../components/ui/icons'
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from '../../lib/format'

/**
 * Opciones de las preferencias del hogar, compartidas por el onboarding (donde
 * se eligen por primera vez) y "Ajustes del hogar" (donde se cambian).
 */

export type ExpenseSplit = 'proporcional' | 'indiferente' | '50-50'

export const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => ({
  value: code,
  label: `${code} ${getCurrencySymbol(code)}`,
}))

export const SPLIT_OPTIONS = [
  {
    value: 'proporcional',
    label: 'Proporcional',
    description: 'Ajustado según el nivel de ingresos de cada uno para una contribución justa.',
    icon: <SlidersIcon />,
  },
  {
    value: 'indiferente',
    label: 'Indiferente',
    description: 'Todo se maneja de forma conjunta, sin divisiones entre los dos.',
    icon: <ClockIcon />,
  },
  {
    value: '50-50',
    label: '50 / 50',
    description: 'Ambos aportan exactamente el mismo porcentaje a las cuentas del hogar.',
    icon: <BoltIcon />,
  },
] as const
