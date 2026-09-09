import { type FormEvent, useState } from 'react'
import { AuthLayout } from '../components/auth/AuthLayout'
import styles from '../components/auth/authForm.module.css'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'

type Mode = 'create' | 'join'

export function HouseholdSetup({ onDone }: { onDone: () => void }) {
  const { user } = useSession()
  const [mode, setMode] = useState<Mode>('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)

    // Se genera el id en el cliente en vez de leerlo de vuelta con .select():
    // households_select_member solo deja ver un household del que ya eres
    // miembro, y justo al crearlo tu perfil todavía no está vinculado.
    const householdId = crypto.randomUUID()

    const { error: insertError } = await supabase.from('households').insert({ id: householdId, name })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    const { error: linkError } = await supabase
      .from('profiles')
      .update({ household_id: householdId })
      .eq('id', user.id)

    if (linkError) {
      setError(linkError.message)
      setSubmitting(false)
      return
    }

    await onDone()
  }

  async function handleJoin(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)

    const { error: joinError } = await supabase
      .from('profiles')
      .update({ household_id: code.trim() })
      .eq('id', user.id)

    if (joinError) {
      setError('Ese código no es válido. Pídele a tu pareja que lo copie de nuevo desde "Ver más".')
      setSubmitting(false)
      return
    }

    await onDone()
  }

  return (
    <AuthLayout>
      <p className={styles.lead}>
        {mode === 'create'
          ? 'Crea tu espacio compartido para empezar a registrar cuentas y movimientos.'
          : 'Pégalo tal como te lo compartió tu pareja desde "Ver más" en la app.'}
      </p>

      {mode === 'create' ? (
        <form className={styles.form} onSubmit={handleCreate}>
          <label className={styles.field}>
            <span className="label">Nombre</span>
            <input
              type="text"
              required
              placeholder="Casa de Mery y Pablo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear'}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleJoin}>
          <label className={styles.field}>
            <span className="label">Código de invitación</span>
            <input
              type="text"
              required
              autoComplete="off"
              placeholder="00000000-0000-0000-0000-000000000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Uniéndote…' : 'Unirme'}
          </button>
        </form>
      )}

      <button
        type="button"
        className={styles.toggle}
        onClick={() => {
          setMode(mode === 'create' ? 'join' : 'create')
          setError(null)
        }}
      >
        {mode === 'create' ? '¿Tu pareja ya tiene un espacio? Únete con un código' : '¿Nadie tiene un espacio todavía? Crea uno'}
      </button>
    </AuthLayout>
  )
}
