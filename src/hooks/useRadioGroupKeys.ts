import { type KeyboardEvent, useRef } from 'react'

/**
 * Teclado de un grupo con role="radiogroup", según el patrón de WAI-ARIA: el
 * grupo es una sola parada de Tab (la opción elegida, o la primera si no hay
 * ninguna) y las flechas mueven el foco y eligen a la vez. Inicio y Fin van a
 * los extremos. Espacio y Enter ya eligen porque cada opción es un <button>.
 *
 * Antes cada opción era su propia parada de Tab y las flechas no hacían nada,
 * al revés de lo que anuncia el lector de pantalla ("botón de opción, 1 de 6").
 *
 * Uso: `const radioProps = useRadioGroupKeys(values, value, onChange)` y
 * `{...radioProps(index)}` en cada botón.
 */
export function useRadioGroupKeys<T>(values: readonly T[], value: T, onChange: (value: T) => void) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const selectedIndex = values.indexOf(value)
  const tabStop = selectedIndex === -1 ? 0 : selectedIndex

  return (index: number) => ({
    ref: (element: HTMLButtonElement | null) => {
      buttons.current[index] = element
    },
    tabIndex: index === tabStop ? 0 : -1,
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      const last = values.length - 1
      let next: number
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = index === last ? 0 : index + 1
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          next = index === 0 ? last : index - 1
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = last
          break
        default:
          return
      }
      event.preventDefault()
      onChange(values[next])
      buttons.current[next]?.focus()
    },
  })
}
