import { type FormEvent, useState } from 'react'
import { OnboardingLayout } from '../components/auth/OnboardingLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ArrowRightIcon, BoltIcon, ClockIcon, PeopleIcon, PersonIcon, SlidersIcon } from '../components/ui/icons'
import { InviteCodeBadge } from '../components/ui/InviteCodeBadge'
import { InviteQrCode } from '../components/ui/InviteQrCode'
import { RadioCardGroup } from '../components/ui/RadioCardGroup'
import { RadioListGroup } from '../components/ui/RadioListGroup'
import { Select } from '../components/ui/Select'
import { TextField } from '../components/ui/TextField'
import { useSession } from '../hooks/useSession'
import { getCurrencySymbol, SUPPORTED_CURRENCIES } from '../lib/format'
import { supabase } from '../lib/supabase'
import styles from './HouseholdSetup.module.css'

type CreateMode = 'individual' | 'pareja'
type ExpenseSplit = 'proporcional' | 'indiferente' | '50-50'
type Step = 'choose' | 'join' | 'invite' | 'preferences'

const CREATE_MODE_OPTIONS = [
  { value: 'individual', label: 'Cuenta individual', icon: <PersonIcon /> },
  { value: 'pareja', label: 'Cuentas en pareja', icon: <PeopleIcon /> },
] as const

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => ({
  value: code,
  label: `${code} ${getCurrencySymbol(code)}`,
}))

const SPLIT_OPTIONS = [
  {
    value: 'proporcional',
    label: 'Proporcional',
    description: 'Ajustado según el nivel de ingresos de cada uno para una contribución justa.',
    icon: <SlidersIcon />,
  },
  {
    value: 'indiferente',
    label: 'Indiferente',
    description: 'Todo se maneja de forma conjunta, sin divisiones entre los dos.',
    icon: <ClockIcon />,
  },
  {
    value: '50-50',
    label: '50 / 50',
    description: 'Ambos aportan exactamente el mismo porcentaje a las cuentas del hogar.',
    icon: <BoltIcon />,
  },
] as const

interface HouseholdSetupProps {
  onDone: () => void
  /** Si una invitación pendiente (link/QR) falló al unir automáticamente. */
  joinError?: string | null
}

export function HouseholdSetup({ onDone, joinError }: HouseholdSetupProps) {
  const { user } = useSession()
  const [step, setStep] = useState<Step>('choose')
  const [createMode, setCreateMode] = useState<CreateMode>('pareja')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)

  const [currency, setCurrency] = useState('CLP')
  const [expenseSplit, setExpenseSplit] = useState<ExpenseSplit>('indiferente')

  // Solo se llena tras crear el household de verdad — antes de eso no hay
  // fila en la base y compartir el código/QR llevaría a un link roto
  // (quien lo abra intentaría unirse a un household que no existe).
  const [createdHouseholdId, setCreatedHouseholdId] = useState<string | null>(null)

  const totalSteps = createMode === 'pareja' ? 3 : 2

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

    // .select().single() a propósito: sin esto, si la política de RLS
    // filtrara la fila (0 filas afectadas), Supabase no lanza error — el
    // update "tendría éxito" sin vincular nada, en silencio.
    const { error: linkError } = await supabase
      .from('profiles')
      .update({ household_id: householdId })
      .eq('id', user.id)
      .select()
      .single()

    if (linkError) {
      setError(linkError.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setCreatedHouseholdId(householdId)
    // El household ya existe: para "pareja" primero se comparte el código,
    // "individual" no tiene con quién compartirlo y va directo a preferencias.
    setStep(createMode === 'pareja' ? 'invite' : 'preferences')
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
      .select()
      .single()

    if (joinUpdateError) {
      setError('Ese código no es válido. Pídele a tu pareja que lo copie de nuevo desde "Ver más".')
      setSubmitting(false)
      return
    }

    // El household ya existía (lo creó y configuró la otra persona) — no hay
    // preferencias que pedir de nuevo, se entra directo.
    await onDone()
  }

  async function handlePreferences(event: FormEvent) {
    event.preventDefault()
    if (!createdHouseholdId) return
    setError(null)
    setSubmitting(true)

    const update: { currency: string; expense_split?: ExpenseSplit } = { currency }
    if (createMode === 'pareja') update.expense_split = expenseSplit

    const { error: prefsError } = await supabase
      .from('households')
      .update(update)
      .eq('id', createdHouseholdId)
      .select()
      .single()

    if (prefsError) {
      setError(prefsError.message)
      setSubmitting(false)
      return
    }

    await onDone()
    setSubmitting(false)
  }

  if (step === 'preferences') {
    return (
      <OnboardingLayout
        step={totalSteps}
        total={totalSteps}
        titleLine1={createMode === 'pareja' ? 'Configuren sus' : 'Configura tus'}
        titleLine2="preferencias financieras"
      >
        <form className={styles.form} onSubmit={handlePreferences}>
          {createMode === 'individual' && (
            <p className={styles.lead}>Elige la moneda en la que quieres ver tus cuentas y movimientos.</p>
          )}

          <Select label="Moneda principal" value={currency} onChange={setCurrency} options={CURRENCY_OPTIONS} required />

          {createMode === 'individual' && (
            <p className={styles.lead}>Podrás cambiarla más adelante desde los ajustes de tu hogar.</p>
          )}

          {createMode === 'pareja' && (
            <>
              <p className={styles.sectionLabel}>¿Cómo prefieren repartir los gastos compartidos?</p>
              <RadioListGroup
                value={expenseSplit}
                onChange={setExpenseSplit}
                options={SPLIT_OPTIONS}
                label="¿Cómo prefieren repartir los gastos compartidos?"
              />
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.cta} disabled={submitting}>
            <span>{submitting ? 'Guardando…' : 'Continuar'}</span>
            {!submitting && <ArrowRightIcon width={18} height={18} />}
          </button>
        </form>
      </OnboardingLayout>
    )
  }

  if (step === 'invite' && createdHouseholdId) {
    const inviteUrl = `${window.location.origin}/unirse/${createdHouseholdId}`

    return (
      <OnboardingLayout step={2} total={totalSteps} titleLine1="¡Ya casi!" titleLine2="invita a tu pareja">
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

        <button type="button" className={styles.cta} onClick={() => setStep('preferences')}>
          <span>Continuar</span>
          <ArrowRightIcon width={18} height={18} />
        </button>
      </OnboardingLayout>
    )
  }

  if (step === 'join') {
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
            setStep('choose')
            setError(null)
          }}
        >
          Volver
        </button>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout step={1} total={totalSteps} titleLine1="¡Comencemos su" titleLine2="viaje juntos!">
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

      <button type="button" className={styles.joinToggle} onClick={() => setStep('join')}>
        ¿Tienes un código? Únete aquí
      </button>
    </OnboardingLayout>
  )
}
