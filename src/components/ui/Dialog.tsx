import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './Dialog.module.css'
import { CloseIcon } from './icons'

/** Igual a --duration-fast: lo que dura la animación de salida en Dialog.module.css. */
const EXIT_MS = 150

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  /**
   * `side` ancla el panel al borde derecho en escritorio, a lo alto de la
   * ventana. En móvil no cambia nada: sigue siendo la hoja que sube.
   */
  placement?: 'center' | 'side'
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Dialog({ open, onClose, title, placement = 'center', children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  // Sigue montado EXIT_MS después de cerrar, para animar la salida. Eso
  // también hace que el foco vuelva al disparador mientras el campo enfocado
  // todavía existe: si el diálogo desapareciera primero, el foco pasaría por
  // <body> y Chrome no mostraría el anillo al devolverlo.
  const [visible, setVisible] = useState(open)
  if (open && !visible) setVisible(true)
  const closing = visible && !open

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => setVisible(false), EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing])

  // Mientras sale, muestra el último contenido que tuvo abierto. Los padres
  // suelen armarlo desde su estado ({editing && <Form/>}), que al cerrar ya es
  // null: sin esto el diálogo se vaciaría (y el campo enfocado desaparecería)
  // durante la animación.
  const [lastChildren, setLastChildren] = useState(children)
  if (open && lastChildren !== children) setLastChildren(children)

  // onClose suele ser una flecha nueva en cada render del padre. Si fuera
  // dependencia del efecto de abajo, cada re-render lo reiniciaría y le
  // robaría el foco al campo en el que se está escribiendo.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    // Recibe el foco de vuelta al cerrar.
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      // Mantiene el foco dentro del diálogo: de un extremo salta al otro.
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      // active === panel: el foco de respaldo (táctil) no debe escapar con Shift+Tab.
      if (event.shiftKey && (active === first || active === panel || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Con teclado, el foco va al primer campo del contenido (no al botón de
    // cerrar). En pantallas táctiles va al panel: enfocar un input abriría el
    // teclado encima de la hoja apenas aparece.
    const firstField = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    const touch = window.matchMedia('(pointer: coarse)').matches
    ;(touch ? panel : (firstField ?? panel)).focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus()
    }
  }, [open])

  if (!visible) return null

  return createPortal(
    <div
      className={placement === 'side' ? `${styles.overlay} ${styles.overlaySide}` : styles.overlay}
      data-state={closing ? 'closing' : 'open'}
      onMouseDown={(event) => {
        if (!closing && event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={panelRef}
      >
        {/* Tirador de la hoja inferior: decorativo, solo en móvil. */}
        <span className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </div>
        <div ref={bodyRef}>{open ? children : lastChildren}</div>
      </div>
    </div>,
    document.body,
  )
}
