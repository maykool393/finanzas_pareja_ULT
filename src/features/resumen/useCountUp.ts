import { type RefObject, useLayoutEffect, useRef } from 'react'

/**
 * Cuenta de 0 a `value` en `duration` ms, con ease-out cúbico (DESIGN.md §
 * Transiciones, excepciones del Resumen). Escribe el texto del nodo en cada
 * cuadro, sin render de React: así no rehace la historia 60 veces por segundo
 * ni reinicia sus demás animaciones.
 *
 * El nodo va vacío en el JSX y con aria-hidden: el valor accesible es el
 * final desde el primer momento, en un texto aparte (visually-hidden).
 * Con reducir movimiento muestra el valor final directo.
 */
export function useCountUp(ref: RefObject<HTMLElement | null>, value: number, format: (value: number) => string, duration = 1000) {
  // El formato suele ser una flecha nueva en cada render: si fuera
  // dependencia, cualquier render reiniciaría la cuenta.
  const formatRef = useRef(format)
  useLayoutEffect(() => {
    formatRef.current = format
  })

  // Layout effect: el primer valor se escribe antes de pintar, sin un cuadro vacío.
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const write = (current: number) => {
      node.textContent = formatRef.current(current)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      write(value)
      return
    }

    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      write(value * (1 - (1 - t) ** 3))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    write(0)
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [ref, value, duration])
}
