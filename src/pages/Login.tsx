import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons'
import styles from '../components/auth/authForm.module.css'
import { FormError } from '../components/ui/FormError'
import { useSession } from '../hooks/useSession'
import { translateAuthError } from '../lib/authErrors'
import { getPendingInvite } from '../lib/pendingInvite'
import { supabase } from '../lib/supabase'

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const description = params.get('error_description')
    if (description) {
      setError(translateAuthError(description.replace(/\+/g, ' ')))
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

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
      const pendingInvite = getPendingInvite()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          // Si venía de un link/QR de invitación, el correo de confirmación
          // debe traer de vuelta a /unirse/:id (ver JoinRedirect) en vez de
          // al destino por defecto — así funciona aunque el link se abra en
          // otro navegador donde no exista el localStorage de esta sesión.
          emailRedirectTo: pendingInvite ? `${window.location.origin}/unirse/${pendingInvite}` : undefined,
        },
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

          {error && <FormError>{error}</FormError>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Un momento…' : mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      )}

      {!confirmEmailSent && <SocialAuthButtons />}

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
