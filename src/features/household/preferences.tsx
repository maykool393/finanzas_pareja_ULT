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
    description: 'Los gastos compartidos se dividen según el ingreso de cada uno.',
    icon: <SlidersIcon />,
  },
  {
    value: 'indiferente',
    label: 'Indiferente',
    description: 'Todo se maneja en conjunto, sin dividir los gastos entre los dos.',
    icon: <ClockIcon />,
  },
  {
    value: '50-50',
    label: '50 / 50',
    description: 'Cada uno paga la mitad de los gastos compartidos.',
    icon: <BoltIcon />,
  },
] as const
