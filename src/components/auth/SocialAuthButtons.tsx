import { supabase } from '../../lib/supabase'
import styles from './authForm.module.css'

type Provider = 'google' | 'apple'

async function signInWithProvider(provider: Provider) {
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
}

export function SocialAuthButtons() {
  return (
    <div className={styles.socialBlock}>
      <div className={styles.divider}>
        <span>o</span>
      </div>

      <button
        type="button"
        className={styles.socialButton}
        onClick={() => signInWithProvider('google')}
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <button
        type="button"
        className={styles.socialButton}
        onClick={() => signInWithProvider('apple')}
      >
        <AppleIcon />
        Continuar con Apple
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.98v2.34C2.47 15.98 5.48 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.65 9c0-.59.1-1.17.3-1.7V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.04z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.47 2.02.98 4.96l2.97 2.34C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.94 9.55c-.02-1.86 1.52-2.75 1.59-2.79-.87-1.27-2.22-1.44-2.7-1.46-1.15-.12-2.24.68-2.83.68-.58 0-1.48-.66-2.44-.65-1.25.02-2.41.73-3.05 1.85-1.3 2.26-.33 5.6.94 7.43.62.9 1.36 1.9 2.32 1.86.93-.04 1.28-.6 2.41-.6s1.44.6 2.42.58c1-.02 1.63-.9 2.24-1.8.7-1.04 1-2.04 1-2.1-.02-.01-1.9-.73-1.9-2.9M12.09 4.13c.52-.63.87-1.5.77-2.38-.75.03-1.66.5-2.2 1.13-.48.55-.9 1.45-.79 2.3.83.06 1.68-.42 2.22-1.05"
      />
    </svg>
  )
}
