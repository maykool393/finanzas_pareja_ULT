import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react'
import styles from './Stories.module.css'

export interface StoryDef {
  key: string
  title: string
  /** Ayuda bajo el título: qué muestra la historia. */
  help: string
  /** 'dark': la de Gastos compartidos, oscura en ambos modos. */
  tone: 'light' | 'dark'
  content: ReactNode
}

interface StoriesProps {
  stories: StoryDef[]
  index: number
  onIndexChange: (index: number) => void
  /** Cambia con el mes: vuelve a correr la entrada de la historia. */
  replayKey: string
}

/**
 * Las historias del mes (DESIGN.md § Resumen). Se avanza tocando: un
 * <button> real cubre el área, debajo del contenido, que deja pasar los
 * toques salvo en sus propios botones (como "Saldar"). Las flechas del
 * teclado avanzan y retroceden, y el título de la historia nueva se anuncia.
 */
export function Stories({ stories, index, onIndexChange, replayKey }: StoriesProps) {
  const titleId = useId()
  const advanceRef = useRef<HTMLButtonElement>(null)
  // Vacío al entrar: solo se anuncia un cambio de historia, no la primera.
  const [announcement, setAnnouncement] = useState('')

  const story = stories[index]
  const next = stories[(index + 1) % stories.length]

  function go(target: number) {
    const wrapped = (target + stories.length) % stories.length
    onIndexChange(wrapped)
    setAnnouncement(`Historia ${wrapped + 1} de ${stories.length}: ${stories[wrapped].title}`)
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    go(index + (event.key === 'ArrowRight' ? 1 : -1))
    // El botón enfocado (ej. "Saldar") puede no existir en la historia nueva.
    advanceRef.current?.focus()
  }

  return (
    <section
      className={story.tone === 'dark' ? `${styles.story} ${styles.dark}` : styles.story}
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.segments} aria-hidden="true">
        {stories.map((s, i) => (
          <span key={s.key} className={i <= index ? `${styles.segment} ${styles.segmentDone}` : styles.segment} />
        ))}
      </div>

      {/* La key vuelve a montar el contenido: la entrada se repite al cambiar de historia o de mes. */}
      <div key={`${story.key}-${replayKey}`} className={styles.body}>
        <span className={styles.watermark} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className={`${styles.heading} ${styles.pop}`}>
          <h2 id={titleId} className={styles.title}>
            {story.title}
          </h2>
          <p className={styles.help}>{story.help}</p>
        </div>
        {story.content}
      </div>

      <button
        ref={advanceRef}
        type="button"
        className={styles.advance}
        aria-label={`Siguiente: ${next.title}`}
        onClick={() => go(index + 1)}
      />

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </section>
  )
}
