import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import authStyles from '../components/auth/authForm.module.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './NotFound.module.css'

/**
 * Cualquier URL que no existe. Va fuera de la sesión (con el fondo del login)
 * porque puede abrirla cualquiera. "/" ya decide a dónde ir: al dashboard con
 * sesión, al login sin ella.
 */
export function NotFound() {
  useDocumentTitle('Página no encontrada')

  return (
    <AuthLayout>
      <h1 className={styles.title}>No encontramos esta página</h1>
      <p className={authStyles.lead}>El enlace puede estar mal escrito, o la página ya no existe.</p>
      <Link to="/" replace className={`${authStyles.submit} ${styles.action}`}>
        Volver al inicio
      </Link>
    </AuthLayout>
  )
}
