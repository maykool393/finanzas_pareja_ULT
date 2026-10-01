import type { SVGProps } from 'react'

// Solo componentes: el registro (mapa ICONS, opciones y tipos de clave) está en
// iconRegistry.ts. Un archivo de componentes que además exporta objetos rompe
// el recargado en caliente de Vite (regla only-export-components).
//
// Decorativos por defecto (aria-hidden): van junto a un texto o dentro de un
// botón con aria-label, que ya dicen lo que hace falta. Sin esto, un lector de
// pantalla anunciaba una "imagen" sin nombre dentro de cada botón de ícono.

export function BankIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 7.5 10 2.5l7.5 5" />
      <path d="M3.5 7.5h13v8h-13z" />
      <path d="M2.5 17.5h15" />
    </svg>
  )
}

export function CashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5.5" width="16" height="9" rx="1.5" />
      <circle cx="10" cy="10" r="2.2" />
      <path d="M4.5 5.5v9M15.5 5.5v9" />
    </svg>
  )
}

export function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M2.5 8h15" />
    </svg>
  )
}

export function PiggyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5a5.5 5.5 0 0 1 5.5-5.5h3a4 4 0 0 1 4 4v.3l1.5.7-1 1.3-.5 2.7-1.5.5v1.5H12v-1H8v1H6.5V13A5.5 5.5 0 0 1 3 10.5Z" />
      <circle cx="12" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function TrendUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2.5 14.5 5-5 3.5 3.5 6.5-7" />
      <path d="M13.5 5.5h4v4" />
    </svg>
  )
}

export function WalletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h10A1.5 1.5 0 0 1 16 6.5V7H4.5A1.5 1.5 0 0 1 3 5.5" />
      <rect x="2.5" y="6.5" width="15" height="9.5" rx="2" />
      <path d="M13.5 11h2" />
    </svg>
  )
}

export function GroceriesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h12l-1.3 8.2a1.5 1.5 0 0 1-1.5 1.3H6.8a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M6.5 7 8 3M13.5 7 12 3" />
      <path d="M7.5 10v4M12.5 10v4" />
    </svg>
  )
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8.5V17h10V8.5" />
      <path d="M8 17v-5h4v5" />
    </svg>
  )
}

export function TransportIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 12.5 5 7.5a2 2 0 0 1 1.9-1.4h6.2A2 2 0 0 1 15 7.5l1.5 5" />
      <rect x="2.5" y="12.5" width="15" height="3.5" rx="1" />
      <circle cx="6" cy="16" r="1.1" />
      <circle cx="14" cy="16" r="1.1" />
    </svg>
  )
}

export function SalaryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2.5" y="6.5" width="15" height="10" rx="1.5" />
      <path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5" />
      <path d="M2.5 11h15" />
    </svg>
  )
}

export function EntertainmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M8.3 7.2v5.6l4.8-2.8z" />
    </svg>
  )
}

export function HealthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 17S3 12.6 3 8.1a3.6 3.6 0 0 1 6.5-2.1L10 6.6l.5-.6A3.6 3.6 0 0 1 17 8.1C17 12.6 10 17 10 17Z" />
    </svg>
  )
}

export function EducationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1.5 7 10 3.5 18.5 7 10 10.5z" />
      <path d="M5 8.8v3.7c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V8.8" />
      <path d="M18.5 7v5" />
    </svg>
  )
}

export function GiftsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="8" width="14" height="9" rx="1" />
      <path d="M3 11.5h14M10 8v9" />
      <path d="M10 8C8.5 8 7 7.2 7 5.8A1.8 1.8 0 0 1 10 4.5c0 1.3-1.5 3.5-1.5 3.5Zm0 0c1.5 0 3-.8 3-2.2A1.8 1.8 0 0 0 10 4.5c0 1.3 1.5 3.5 1.5 3.5Z" />
    </svg>
  )
}

export function SubscriptionsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8.5A6 6 0 0 0 5.5 6" />
      <path d="M4 5.5v3h3" />
      <path d="M4 11.5A6 6 0 0 0 14.5 14" />
      <path d="M16 14.5v-3h-3" />
    </svg>
  )
}

export function OtherIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h4l2 2h5A1.5 1.5 0 0 1 17 7.5v7A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5Z" />
    </svg>
  )
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7.5" y="7.5" width="9" height="9" rx="1.5" />
      <path d="M4.5 12.5v-7A1.5 1.5 0 0 1 6 4h7" />
    </svg>
  )
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10h12M11 5.5 16 10l-5 4.5" />
    </svg>
  )
}

/* ---------- Navegación y controles de interfaz ---------- */

export function SwapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6.5h11.5M12.5 3.5l3 3-3 3" />
      <path d="M16 13.5H4.5m3 3-3-3 3-3" />
    </svg>
  )
}

export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 17V10M10 17V3M16 17v-6.5" />
    </svg>
  )
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  )
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m8 5 5 5-5 5" />
    </svg>
  )
}

/** Volver (onboarding) y mes anterior (Resumen). */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 5-5 5 5 5" />
    </svg>
  )
}

/** Cerrar sesión: puerta con una flecha que sale. */
export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 3.5H5A1.5 1.5 0 0 0 3.5 5v10A1.5 1.5 0 0 0 5 16.5h3" />
      <path d="M13 6.5 16.5 10 13 13.5M16.5 10H8" />
    </svg>
  )
}

/** Opción elegida (filas de opción) y "Copiado". */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" />
    </svg>
  )
}

/** "Ver más": cuatro puntos en cuadrícula. Rellenos: a este tamaño un punto en contorno no se lee. */
export function GridDotsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <circle cx="6.5" cy="6.5" r="1.6" />
      <circle cx="13.5" cy="6.5" r="1.6" />
      <circle cx="6.5" cy="13.5" r="1.6" />
      <circle cx="13.5" cy="13.5" r="1.6" />
    </svg>
  )
}

export function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="2.5" width="8" height="15" rx="2" />
      <path d="M9 15h2" />
    </svg>
  )
}

export function QrIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="12" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="12" width="5" height="5" rx="1" />
      <path d="M12 12h1.5M15.5 12H17M12 15.5v1.5M15.5 15.5H17V17" />
    </svg>
  )
}

/** Compartir por WhatsApp: un globo de chat propio, no el logo de la marca. */
export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 9.6a6.6 6.6 0 0 1-9.8 5.8L3 16.5l1.1-3.9A6.6 6.6 0 1 1 17 9.6Z" />
    </svg>
  )
}

/** Metas (pantalla final del onboarding). */
export function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.8" />
      <circle cx="10" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** "Saldar" en Gastos compartidos. */
export function MoneyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 2.5v15" />
      <path d="M13.8 5.5H8.6a2.6 2.6 0 0 0 0 5.2h2.8a2.6 2.6 0 0 1 0 5.2H5.8" />
    </svg>
  )
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="4" />
      <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9 4.5 4.5" />
    </svg>
  )
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 11.5A7.5 7.5 0 0 1 8.5 3a7.5 7.5 0 1 0 8.5 8.5Z" />
    </svg>
  )
}

/* ---------- Onboarding ---------- */

/** Reparto proporcional al ingreso — paso de preferencias en HouseholdSetup. */
export function SlidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h14M3 10h14M3 14h14" />
      <circle cx="8" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="13" cy="10" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="14" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Reparto indiferente/conjunto — paso de preferencias en HouseholdSetup. */
export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.2v4l3 1.8" />
    </svg>
  )
}

/** Reparto 50/50 — paso de preferencias en HouseholdSetup. */
export function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 2.5 4.5 11h4.2l-.7 6.5 6.5-8.5h-4.2z" />
    </svg>
  )
}

/** Cuenta principal. Rellena: una estrella de contorno a 13px no se lee (DESIGN.md § Iconografía). */
export function StarFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="m10 2.2 2.4 5 5.4.6-4 3.7 1.1 5.4L10 14.2l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />
    </svg>
  )
}

