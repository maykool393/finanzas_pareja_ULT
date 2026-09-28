import { type FormEvent, useState } from 'react'
import { OnboardingLayout } from '../components/auth/OnboardingLayout'
import { AccountTypeIllustration } from '../components/illustrations/AccountTypeIllustration'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormError } from '../components/ui/FormError'
import { CurrencyPicker } from '../components/ui/CurrencyPicker'
import { ArrowRightIcon } from '../components/ui/icons'
import { InviteCodeBadge } from '../components/ui/InviteCodeBadge'
import { InviteQrCode } from '../components/ui/InviteQrCode'
import { OptionRows } from '../components/ui/OptionRows'
import { RadioListGroup } from '../components/ui/RadioListGroup'
import { TextField } from '../components/ui/TextField'
import { type ExpenseSplit, SPLIT_OPTIONS } from '../features/household/preferences'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSession } from '../hooks/useSession'
import { ERROR_MESSAGES } from '../lib/errorMessages'
import { formatInviteCode, inviteUrl, joinHousehold } from '../lib/inviteCode'
import { supabase } from '../lib/supabase'
import styles from './HouseholdSetup.module.css'

type CreateMode = 'individual' | 'pareja'
type Step = 'choose' | 'join' | 'invite' | 'preferences'

const CREATE_MODE_OPTIONS = [
  {
    value: 'individual',
    title: 'Solo yo',
    description: 'Llevas tus finanzas de forma individual',
    illustration: <AccountTypeIllustration people={1} />,
  },
  {
    value: 'pareja',
    title: 'Crear en pareja',
    description: 'Creas el hogar y comparten los gastos juntos',
    illustration: <AccountTypeIllustration people={2} />,
  },
] as const

interface HouseholdSetupProps {
  onDone: () => void
  /** Si una invitación pendiente (link/QR) falló al unir automáticamente. */
  joinError?: string | null
}

export function HouseholdSetup({ onDone, joinError }: HouseholdSetupProps) {
  useDocumentTitle('Configura tu hogar')
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
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  const totalSteps = createMode === 'pareja' ? 3 : 2

  async function handleShare(url: string) {
    if (navigator.share) {
      await navigator.share({ title: 'Únete a nuestro hogar en Twoney', url })
    } else {
      await navigator.clipboard.writeText(url)
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
      console.error(insertError)
      // El mensaje de Supabase es técnico y en inglés: va a la consola, no a la pantalla.
      setError(ERROR_MESSAGES.createHousehold)
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
      console.error(linkError)
      setError(ERROR_MESSAGES.createHousehold)
      setSubmitting(false)
      return
    }

    // El código lo genera la base al crear el hogar; recién ahora, ya
    // vinculado, households_select_member deja leerlo.
    const { data: created, error: codeError } = await supabase
      .from('households')
      .select('invite_code')
      .eq('id', householdId)
      .single()

    if (codeError) {
      console.error(codeError)
      setError(ERROR_MESSAGES.createHousehold)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setInviteCode(created.invite_code)
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

    // join_household (en la base) busca el hogar por el código y vincula el
    // perfil. El mensaje nombra la causa: código inexistente, hogar lleno o sin conexión.
    const failure = await joinHousehold(code)

    if (failure) {
      setError(failure)
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
      console.error(prefsError)
      setError(ERROR_MESSAGES.save)
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

          <CurrencyPicker value={currency} onChange={setCurrency} />

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

          {error && <FormError>{error}</FormError>}

          <button type="submit" className={styles.cta} disabled={submitting}>
            <span>{submitting ? 'Guardando…' : 'Continuar'}</span>
            {!submitting && <ArrowRightIcon width={18} height={18} />}
          </button>
        </form>
      </OnboardingLayout>
    )
  }

  if (step === 'invite' && inviteCode) {
    const url = inviteUrl(inviteCode)

    return (
      <OnboardingLayout step={2} total={totalSteps} titleLine1="¡Ya casi!" titleLine2="invita a tu pareja">
        <p className={styles.lead}>Comparte este código o QR para que se una a su espacio compartido.</p>

        <Card className={styles.panel}>
          <div>
            <span className={`label ${styles.codeLabel}`}>Código de vinculación</span>
            <InviteCodeBadge code={formatInviteCode(inviteCode)} />
          </div>
          <div className={styles.actionsRow}>
            <Button type="button" variant="secondary" onClick={() => handleShare(url)}>
              Compartir
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowQr((v) => !v)}>
              Ver QR
            </Button>
          </div>
          {showQr && <InviteQrCode url={url} />}
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
            placeholder="XXXX-XXXX"
            variant="code"
          />

          {error && <FormError>{error}</FormError>}

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
          ? 'Lleva tus finanzas solo. Si luego quieres, puedes invitar a tu pareja.'
          : 'Crea tu espacio compartido para empezar a registrar cuentas y movimientos.'}
      </p>

      {joinError && <FormError>{joinError}</FormError>}

      <OptionRows
        value={createMode}
        onChange={setCreateMode}
        options={CREATE_MODE_OPTIONS}
        label="¿Cómo vas a usar Twoney?"
      />

      <form className={styles.form} onSubmit={handleCreate}>
        <TextField
          label="Ponle nombre a tu hogar"
          value={name}
          onChange={setName}
          required
          placeholder="Ej. Casa Feliz"
          variant="underline"
        />

        {error && <FormError>{error}</FormError>}

        <button type="submit" className={styles.cta} disabled={submitting}>
          <span>{submitting ? 'Creando…' : 'Crear'}</span>
          {!submitting && <ArrowRightIcon width={18} height={18} />}
        </button>
      </form>

      <button type="button" className={styles.joinToggle} onClick={() => setStep('join')}>
        ¿Tienes un código? Únete aquí
      </button>

      {/* Sin esto, quien entró con la cuenta equivocada no tenía cómo salir del onboarding. */}
      <button type="button" className={styles.backLink} onClick={() => supabase.auth.signOut()}>
        Cerrar sesión
      </button>
    </OnboardingLayout>
  )
}
