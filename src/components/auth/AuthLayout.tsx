import type { ReactNode } from 'react'
import { RippleBackground } from '../RippleBackground'
import styles from './authForm.module.css'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <RippleBackground>
      <div className={styles.page}>
        <div className={styles.card}>
          <img src="/logo.svg" alt="WeWallet" className={styles.logo} />
          {children}
        </div>
      </div>
    </RippleBackground>
  )
}
