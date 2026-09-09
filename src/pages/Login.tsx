import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import styles from '../components/auth/authForm.module.css'
import { supabase } from '../lib/supabase'
import { translateAuthError } from '../lib/authErrors'
import { useSession } from '../hooks/useSession'

type Mode = 'signin' | 'signup'

export function Login() {
  const { session, loading: sessionLoading } = useSession()
  const location = useLocation()

  const [mode, setMode] = useState<Mode>(location.pathname === '/registro' ? 'signup' : 'signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmEmailSent, setConfirmEmailSent] = useState(false)

  if (!sessionLoading && session) {
    const from = (location.state as { from?: Location })?.from
    return <Navigate to={from?.pathname ?? '/dashboard'} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    if (mode === 'signin') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError(translateAuthError(signInError.message))
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      })
      if (signUpError) {
        setError(translateAuthError(signUpError.message))
      } else if (data.user && !data.session) {
        setConfirmEmailSent(true)
      }
    }

    setSubmitting(false)
  }

  return (
    <AuthLayout>
      {confirmEmailSent ? (
        <p className={styles.notice}>
          Te enviamos un correo a <strong>{email}</strong> para confirmar tu cuenta.
        </p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className={styles.field}>
              <span className="label">Nombre</span>
              <input
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
          )}

          <label className={styles.field}>
            <span className="label">Correo</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className="label">Contraseña</span>
            <input
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {mode === 'signin' && (
            <Link to="/recuperar" className={styles.forgot}>
              ¿Olvidaste tu contraseña?
            </Link>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Un momento…' : mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      )}

      {!confirmEmailSent && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
          }}
        >
          {mode === 'signin' ? '¿No tienes cuenta? Crea una' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      )}
    </AuthLayout>
  )
}
