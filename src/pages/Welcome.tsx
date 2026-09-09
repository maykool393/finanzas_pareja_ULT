import { Link, Navigate } from 'react-router-dom'
import welcomeHero from '../assets/welcome-hero.jpg'
import { useSession } from '../hooks/useSession'
import styles from './Welcome.module.css'

const ONBOARDING_KEY = 'hasSeenOnboarding'

function markOnboardingSeen() {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

export function Welcome() {
  const { session, loading } = useSession()
  const seen = localStorage.getItem(ONBOARDING_KEY) === 'true'

  if (loading) return <div className={styles.splash} aria-busy="true" />

  if (seen || session) {
    return <Navigate to={session ? '/dashboard' : '/login'} replace />
  }

  return (
    <div className={styles.screen}>
      <img src={welcomeHero} alt="" aria-hidden="true" className={styles.backgroundImage} />
      <div className={styles.topScrim} aria-hidden="true" />
      <div className={styles.bottomOverlay} aria-hidden="true" />

      <header className={styles.header}>
        <img src="/logo.svg" alt="WeWallet" className={styles.logo} />
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Todo lo suyo, lo tuyo y lo de ambos, en un solo lugar</h1>

        <div className={styles.actions}>
          <Link to="/registro" className={styles.primary} onClick={markOnboardingSeen}>
            Comenzar
          </Link>
          <Link to="/login" className={styles.secondary} onClick={markOnboardingSeen}>
            ¿Ya tienes cuenta? Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
