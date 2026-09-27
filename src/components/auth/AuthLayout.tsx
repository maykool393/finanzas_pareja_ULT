import type { ReactNode } from 'react'
import { RippleBackground } from '../RippleBackground'
import styles from './authForm.module.css'

/**
 * `title` es el <h1> de la pantalla, solo para lectores de pantalla: a la vista,
 * el logo ya encabeza la tarjeta. Se omite cuando la página muestra su propio
 * título visible (404).
 */
export function AuthLayout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <RippleBackground>
      <div className={styles.page}>
        <div className={styles.card}>
          <img src="/logo.svg" alt="Twoney" className={styles.logo} />
          {title && <h1 className="visually-hidden">{title}</h1>}
          {children}
        </div>
      </div>
    </RippleBackground>
  )
}
