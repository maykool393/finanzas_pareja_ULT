import type { SVGProps } from 'react'

interface AccountTypeIllustrationProps extends SVGProps<SVGSVGElement> {
  /** 1 = "Solo yo"; 2 = "Crear en pareja" (dos iguales, solapadas). */
  people: 1 | 2
}

/**
 * Tipo de cuenta del onboarding (DESIGN.md § Ilustraciones): un círculo
 * punteado y una persona de trazo 2px. La persona usa currentColor, que la
 * fila de opción cambia según el estado; el círculo es decorativo
 * (--border-strong). Decorativa: la fila ya dice qué opción es.
 */
export function AccountTypeIllustration({ people, ...props }: AccountTypeIllustrationProps) {
  const person = (offset: number) => (
    <g key={offset} transform={`translate(${offset} 0)`}>
      <circle cx="60" cy="60" r="46" stroke="var(--border-strong)" strokeWidth="1.4" strokeDasharray="3 7" />
      <circle cx="60" cy="46" r="14" stroke="currentColor" strokeWidth="2" />
      <path d="M30 92c0-16 13.4-26 30-26s30 10 30 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="95" cy="28" r="3" fill="currentColor" />
    </g>
  )

  // Dos personas: la segunda se corre 82 unidades (el −38px del prototipo a 120 de ancho).
  const width = people === 1 ? 120 : 202
  return (
    <svg viewBox={`0 0 ${width} 120`} fill="none" aria-hidden="true" {...props}>
      {people === 1 ? person(0) : [person(0), person(82)]}
    </svg>
  )
}
