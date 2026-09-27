import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import styles from '../components/auth/authForm.module.css'
import { FormError } from '../components/ui/FormError'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { supabase } from '../lib/supabase'
import { translateAuthError } from '../lib/authErrors'

export function ForgotPassword() {
  useDocumentTitle('Recuperar contraseña')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/restablecer`,
    })

    if (resetError) setError(translateAuthError(resetError.message))
    else setSent(true)

    setSubmitting(false)
  }

  return (
    <AuthLayout title="Recuperar contraseña">
      {sent ? (
        <p className={styles.notice}>
          Si <strong>{email}</strong> tiene una cuenta, te enviamos un correo con un enlace para
          restablecer tu contraseña.
        </p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.lead}>
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>

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

          {error && <FormError>{error}</FormError>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      )}

      <Link to="/login" className={styles.toggle}>
        Volver a iniciar sesión
      </Link>
    </AuthLayout>
  )
}
