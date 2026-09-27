import type { ReactElement, SVGProps } from 'react'
import {
  BankIcon,
  CardIcon,
  CashIcon,
  EducationIcon,
  EntertainmentIcon,
  GiftsIcon,
  GroceriesIcon,
  HealthIcon,
  HomeIcon,
  OtherIcon,
  PiggyIcon,
  SalaryIcon,
  SubscriptionsIcon,
  TransportIcon,
  TrendUpIcon,
  WalletIcon,
} from './icons'

/**
 * Registro de los íconos que el usuario elige (cuentas, deudas, inversiones y
 * categorías): la clave que se guarda en la base de datos, su componente y su
 * etiqueta. Los íconos en sí viven en icons.tsx.
 */

export type AccountIconKey = 'bank' | 'cash' | 'card' | 'piggy' | 'trend-up' | 'wallet'
export type CategoryIconKey =
  | 'groceries'
  | 'home'
  | 'transport'
  | 'salary'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'gifts'
  | 'subscriptions'
  | 'other'
export type IconKey = AccountIconKey | CategoryIconKey

export const ICONS: Record<IconKey, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  bank: BankIcon,
  cash: CashIcon,
  card: CardIcon,
  piggy: PiggyIcon,
  'trend-up': TrendUpIcon,
  wallet: WalletIcon,
  groceries: GroceriesIcon,
  home: HomeIcon,
  transport: TransportIcon,
  salary: SalaryIcon,
  entertainment: EntertainmentIcon,
  health: HealthIcon,
  education: EducationIcon,
  gifts: GiftsIcon,
  subscriptions: SubscriptionsIcon,
  other: OtherIcon,
}

export const ACCOUNT_ICON_OPTIONS: { key: AccountIconKey; label: string }[] = [
  { key: 'bank', label: 'Banco' },
  { key: 'cash', label: 'Efectivo' },
  { key: 'card', label: 'Tarjeta' },
  { key: 'wallet', label: 'Billetera' },
  { key: 'piggy', label: 'Ahorro' },
  { key: 'trend-up', label: 'Inversión' },
]

export const CATEGORY_ICON_OPTIONS: { key: CategoryIconKey; label: string }[] = [
  { key: 'groceries', label: 'Supermercado' },
  { key: 'home', label: 'Hogar' },
  { key: 'transport', label: 'Transporte' },
  { key: 'salary', label: 'Sueldo' },
  { key: 'entertainment', label: 'Entretención' },
  { key: 'health', label: 'Salud' },
  { key: 'education', label: 'Educación' },
  { key: 'gifts', label: 'Regalos' },
  { key: 'subscriptions', label: 'Suscripciones' },
  { key: 'other', label: 'Otro' },
]
