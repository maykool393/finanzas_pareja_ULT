import { type FormEvent, useState } from 'react'
import { OnboardingLayout } from '../components/auth/OnboardingLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ArrowRightIcon, LinkIcon, PeopleIcon } from '../components/ui/icons'
import { InviteCodeBadge } from '../components/ui/InviteCodeBadge'
import { InviteQrCode } from '../components/ui/InviteQrCode'
import { RadioCardGroup } from '../components/ui/RadioCardGroup'
import { TextField } from '../components/ui/TextField'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'
import styles from './HouseholdSetup.module.css'

type Mode = 'create' | 'join'

const MODE_OPTIONS = [
  { value: 'create', label: 'Crear una pareja', icon: <PeopleIcon /> },
  { value: 'join', label: 'Unirme a una', icon: <LinkIcon /> },
] as const

interface HouseholdSetupProps {
  onDone: () => void
  /** Si una invitación pendiente (link/QR) falló al unir automáticamente. */
  joinError?: string | null
}

export function HouseholdSetup({ onDone, joinError }: HouseholdSetupProps) {
  const { user } = useSession()
  const [mode, setMode] = useState<Mode>('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)

  // Generado una vez al entrar: se muestra en el panel de "crear" antes de
  // enviar el formulario, y es el mismo id que se inserta al confirmar.
  const [householdId] = useState(() => crypto.randomUUID())
  const inviteUrl = `${window.location.origin}/unirse/${householdId}`

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: 'Únete a nuestro hogar en Twoney', url: inviteUrl })
    } else {
      await navigator.clipboard.writeText(inviteUrl)
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)

    // Se genera el id en el cliente en vez de leerlo de vuelta con .select():
    // households_select_member solo deja ver un household del que ya eres
    // miembro, y justo al crearlo tu perfil todavía no está vinculado.
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

    const { error: joinUpdateError } = await supabase
      .from('profiles')
      .update({ household_id: code.trim() })
      .eq('id', user.id)

    if (joinUpdateError) {
      setError('Ese código no es válido. Pídele a tu pareja que lo copie de nuevo desde "Ver más".')
      setSubmitting(false)
      return
    }

    await onDone()
  }

  return (
    <OnboardingLayout step={1} total={1} titleLine1="¡Comencemos su" titleLine2="viaje juntos!">
      <p className={styles.lead}>
        {mode === 'create'
          ? 'Crea tu espacio compartido para empezar a registrar cuentas y movimientos.'
          : 'Pégalo tal como te lo compartió tu pareja desde "Ver más" en la app.'}
      </p>

      {joinError && <p className={styles.error}>{joinError}</p>}

      <RadioCardGroup value={mode} onChange={setMode} options={MODE_OPTIONS} label="¿Cómo quieren vincularse?" />

      {mode === 'create' ? (
        <form className={styles.form} onSubmit={handleCreate}>
          <TextField label="Nombre del hogar" value={name} onChange={setName} required placeholder="Casa de Mery y Pablo" />

          <Card className={styles.panel}>
            <div>
              <span className={`label ${styles.codeLabel}`}>Código de vinculación</span>
              <InviteCodeBadge code={householdId} />
            </div>
            <div className={styles.actionsRow}>
              <Button type="button" variant="secondary" onClick={handleShare}>
                Compartir
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowQr((v) => !v)}>
                Ver QR
              </Button>
            </div>
            {showQr && <InviteQrCode url={inviteUrl} />}
          </Card>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.cta} disabled={submitting}>
            <span>{submitting ? 'Creando…' : 'Crear'}</span>
            {!submitting && <ArrowRightIcon width={18} height={18} />}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleJoin}>
          <TextField
            label="Código de invitación"
            value={code}
            onChange={setCode}
            required
            autoComplete="off"
            placeholder="00000000-0000-0000-0000-000000000000"
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.cta} disabled={submitting}>
            <span>{submitting ? 'Uniéndote…' : 'Unirme'}</span>
            {!submitting && <ArrowRightIcon width={18} height={18} />}
          </button>
        </form>
      )}
    </OnboardingLayout>
  )
}
