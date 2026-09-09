import type { ReactElement, SVGProps } from 'react'

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

export function BankIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 7.5 10 2.5l7.5 5" />
      <path d="M3.5 7.5h13v8h-13z" />
      <path d="M2.5 17.5h15" />
    </svg>
  )
}

export function CashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5.5" width="16" height="9" rx="1.5" />
      <circle cx="10" cy="10" r="2.2" />
      <path d="M4.5 5.5v9M15.5 5.5v9" />
    </svg>
  )
}

export function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M2.5 8h15" />
    </svg>
  )
}

export function PiggyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5a5.5 5.5 0 0 1 5.5-5.5h3a4 4 0 0 1 4 4v.3l1.5.7-1 1.3-.5 2.7-1.5.5v1.5H12v-1H8v1H6.5V13A5.5 5.5 0 0 1 3 10.5Z" />
      <circle cx="12" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrendUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2.5 14.5 5-5 3.5 3.5 6.5-7" />
      <path d="M13.5 5.5h4v4" />
    </svg>
  )
}

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h10A1.5 1.5 0 0 1 16 6.5V7H4.5A1.5 1.5 0 0 1 3 5.5" />
      <rect x="2.5" y="6.5" width="15" height="9.5" rx="2" />
      <path d="M13.5 11h2" />
    </svg>
  )
}

export function GroceriesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h12l-1.3 8.2a1.5 1.5 0 0 1-1.5 1.3H6.8a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M6.5 7 8 3M13.5 7 12 3" />
      <path d="M7.5 10v4M12.5 10v4" />
    </svg>
  )
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8.5V17h10V8.5" />
      <path d="M8 17v-5h4v5" />
    </svg>
  )
}

export function TransportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 12.5 5 7.5a2 2 0 0 1 1.9-1.4h6.2A2 2 0 0 1 15 7.5l1.5 5" />
      <rect x="2.5" y="12.5" width="15" height="3.5" rx="1" />
      <circle cx="6" cy="16" r="1.1" />
      <circle cx="14" cy="16" r="1.1" />
    </svg>
  )
}

export function SalaryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="6.5" width="15" height="10" rx="1.5" />
      <path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5" />
      <path d="M2.5 11h15" />
    </svg>
  )
}

export function EntertainmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M8.3 7.2v5.6l4.8-2.8z" />
    </svg>
  )
}

export function HealthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 17S3 12.6 3 8.1a3.6 3.6 0 0 1 6.5-2.1L10 6.6l.5-.6A3.6 3.6 0 0 1 17 8.1C17 12.6 10 17 10 17Z" />
    </svg>
  )
}

export function EducationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1.5 7 10 3.5 18.5 7 10 10.5z" />
      <path d="M5 8.8v3.7c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V8.8" />
      <path d="M18.5 7v5" />
    </svg>
  )
}

export function GiftsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="8" width="14" height="9" rx="1" />
      <path d="M3 11.5h14M10 8v9" />
      <path d="M10 8C8.5 8 7 7.2 7 5.8A1.8 1.8 0 0 1 10 4.5c0 1.3-1.5 3.5-1.5 3.5Zm0 0c1.5 0 3-.8 3-2.2A1.8 1.8 0 0 0 10 4.5c0 1.3 1.5 3.5 1.5 3.5Z" />
    </svg>
  )
}

export function SubscriptionsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8.5A6 6 0 0 0 5.5 6" />
      <path d="M4 5.5v3h3" />
      <path d="M4 11.5A6 6 0 0 0 14.5 14" />
      <path d="M16 14.5v-3h-3" />
    </svg>
  )
}

export function OtherIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h4l2 2h5A1.5 1.5 0 0 1 17 7.5v7A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5Z" />
    </svg>
  )
}

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
