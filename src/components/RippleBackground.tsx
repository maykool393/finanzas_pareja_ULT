import { type ReactNode, useEffect, useRef } from 'react'
import darkBg from '../assets/login-background-dark.png'
import lightBg from '../assets/login-background.png'
import { useTheme } from '../hooks/useTheme'
import styles from './RippleBackground.module.css'

interface RippleBackgroundProps {
  children: ReactNode
  /** Tema a usar para elegir el asset de fondo. Si se omite, se detecta vía data-theme. */
  theme?: 'light' | 'dark'
}

interface Ripple {
  x: number
  y: number
  start: number
}

const MAX_RIPPLES = 6
const RING_COUNT = 3
const RING_STAGGER_MS = 140
const RING_DURATION_MS = 1400
const MAX_RADIUS = 160
const WHITE_RGB = '255, 255, 255'
const FALLBACK_ACCENT_RGB = '127, 119, 221' // #7F77DD, por si la variable no resuelve a tiempo

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function hexToRgb(hex: string): string | null {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim())
  if (!match) return null
  const [, r, g, b] = match
  return `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`
}

export function RippleBackground({ children, theme: themeProp }: RippleBackgroundProps) {
  const { theme: detectedTheme } = useTheme()
  const theme = themeProp ?? detectedTheme

  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const frameRef = useRef(0)
  const accentRgbRef = useRef(FALLBACK_ACCENT_RGB)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrapper || !canvas || !ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const accent = hexToRgb(getComputedStyle(wrapper).getPropertyValue('--account-b'))
    if (accent) accentRgbRef.current = accent

    function resizeCanvas() {
      const rect = wrapper!.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas!.width = rect.width * dpr
      canvas!.height = rect.height * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    function handlePointerDown(event: PointerEvent) {
      if (reducedMotion) return
      const rect = wrapper!.getBoundingClientRect()
      const ripples = ripplesRef.current
      if (ripples.length >= MAX_RIPPLES) ripples.shift()
      ripples.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, start: performance.now() })
    }
    wrapper.addEventListener('pointerdown', handlePointerDown)

    function draw() {
      const rect = wrapper!.getBoundingClientRect()
      ctx!.clearRect(0, 0, rect.width, rect.height)

      const now = performance.now()
      const rippleLifespan = RING_DURATION_MS + (RING_COUNT - 1) * RING_STAGGER_MS
      ripplesRef.current = ripplesRef.current.filter((r) => now - r.start < rippleLifespan)

      for (const ripple of ripplesRef.current) {
        for (let ring = 0; ring < RING_COUNT; ring++) {
          const elapsed = now - ripple.start - ring * RING_STAGGER_MS
          if (elapsed < 0 || elapsed > RING_DURATION_MS) continue

          const t = elapsed / RING_DURATION_MS
          const radius = MAX_RADIUS * easeOutCubic(t)
          const opacity = (1 - t) * 0.45
          const rgb = ring % 2 === 0 ? WHITE_RGB : accentRgbRef.current

          ctx!.beginPath()
          ctx!.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
          ctx!.strokeStyle = `rgba(${rgb}, ${opacity.toFixed(3)})`
          ctx!.lineWidth = 2
          ctx!.stroke()
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      wrapper.removeEventListener('pointerdown', handlePointerDown)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const backgroundSrc = theme === 'dark' ? darkBg : lightBg

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <img src={backgroundSrc} alt="" aria-hidden="true" className={styles.background} />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  )
}
