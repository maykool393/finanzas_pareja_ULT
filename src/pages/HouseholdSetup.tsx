import { type FormEvent, useState } from 'react'
import { OnboardingLayout } from '../components/auth/OnboardingLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ArrowRightIcon, PeopleIcon, PersonIcon } from '../components/ui/icons'
import { InviteCodeBadge } from '../components/ui/InviteCodeBadge'
import { InviteQrCode } from '../components/ui/InviteQrCode'
import { RadioCardGroup } from '../components/ui/RadioCardGroup'
import { TextField } from '../components/ui/TextField'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'
import styles from './HouseholdSetup.module.css'

type CreateMode = 'individual' | 'pareja'

const CREATE_MODE_OPTIONS = [
  { value: 'individual', label: 'Cuenta individual', icon: <PersonIcon /> },
  { value: 'pareja', label: 'Cuentas en pareja', icon: <PeopleIcon /> },
] as const

interface HouseholdSetupProps {
  onDone: () => void
  /** Si una invitación pendiente (link/QR) falló al unir automáticamente. */
  joinError?: string | null
}

export function HouseholdSetup({ onDone, joinError }: HouseholdSetupProps) {
  const { user } = useSession()
  const [createMode, setCreateMode] = useState<CreateMode>('pareja')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)

  // Solo se llena tras crear el household de verdad — antes de eso no hay
  // fila en la base y compartir el código/QR llevaría a un link roto
  // (quien lo abra intentaría unirse a un household que no existe).
  const [createdHouseholdId, setCreatedHouseholdId] = useState<string | null>(null)

  async function handleShare(inviteUrl: string) {
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

    const householdId = crypto.randomUUID()

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

    setSubmitting(false)

    if (createMode === 'pareja') {
      // El household ya existe: ahora sí se puede mostrar/compartir el código.
      setCreatedHouseholdId(householdId)
    } else {
      await onDone()
    }
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

  // Paso 2 (solo "cuentas en pareja"): el household ya existe, se comparte
  // el código/QR reales antes de entrar al dashboard.
  if (createdHouseholdId) {
    const inviteUrl = `${window.location.origin}/unirse/${createdHouseholdId}`

    return (
      <OnboardingLayout step={2} total={2} titleLine1="¡Ya casi!" titleLine2="invita a tu pareja">
        <p className={styles.lead}>Comparte este código o QR para que se una a su espacio compartido.</p>

        <Card className={styles.panel}>
          <div>
            <span className={`label ${styles.codeLabel}`}>Código de vinculación</span>
            <InviteCodeBadge code={createdHouseholdId} />
          </div>
          <div className={styles.actionsRow}>
            <Button type="button" variant="secondary" onClick={() => handleShare(inviteUrl)}>
              Compartir
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowQr((v) => !v)}>
              Ver QR
            </Button>
          </div>
          {showQr && <InviteQrCode url={inviteUrl} />}
        </Card>

        <button type="button" className={styles.cta} onClick={onDone}>
          <span>Continuar</span>
          <ArrowRightIcon width={18} height={18} />
        </button>
      </OnboardingLayout>
    )
  }

  // "Tengo un código": pantalla aparte, no compite con la elección de arriba.
  if (showJoinForm) {
    return (
      <OnboardingLayout step={1} total={1} titleLine1="¡Comencemos su" titleLine2="viaje juntos!">
        <p className={styles.lead}>Pégalo tal como te lo compartió tu pareja desde "Ver más" en la app.</p>

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

        <button
          type="button"
          className={styles.backLink}
          onClick={() => {
            setShowJoinForm(false)
            setError(null)
          }}
        >
          Volver
        </button>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      step={1}
      total={createMode === 'pareja' ? 2 : 1}
      titleLine1="¡Comencemos su"
      titleLine2="viaje juntos!"
    >
      <p className={styles.lead}>
        {createMode === 'individual'
          ? 'Lleva tus finanzas solo — luego podrás invitar a tu pareja cuando quieras.'
          : 'Crea tu espacio compartido para empezar a registrar cuentas y movimientos.'}
      </p>

      {joinError && <p className={styles.error}>{joinError}</p>}

      <RadioCardGroup
        value={createMode}
        onChange={setCreateMode}
        options={CREATE_MODE_OPTIONS}
        label="¿Cómo quieren llevar las finanzas?"
      />

      <form className={styles.form} onSubmit={handleCreate}>
        <TextField
          label="Nombre del hogar"
          value={name}
          onChange={setName}
          required
          placeholder={createMode === 'individual' ? 'Casa de Juan' : 'Casa de Mery y Pablo'}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.cta} disabled={submitting}>
          <span>{submitting ? 'Creando…' : 'Crear'}</span>
          {!submitting && <ArrowRightIcon width={18} height={18} />}
        </button>
      </form>

      <button type="button" className={styles.joinToggle} onClick={() => setShowJoinForm(true)}>
        ¿Tienes un código? Únete aquí
      </button>
    </OnboardingLayout>
  )
}
