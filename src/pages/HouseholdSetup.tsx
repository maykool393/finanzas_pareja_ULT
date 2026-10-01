import { type FormEvent, type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '../components/auth/OnboardingLayout'
import { AccountTypeIllustration } from '../components/illustrations/AccountTypeIllustration'
import { DoneIllustration } from '../components/illustrations/DoneIllustration'
import { CurrencyPicker } from '../components/ui/CurrencyPicker'
import { FormError } from '../components/ui/FormError'
import { ArrowRightIcon, BoltIcon, TargetIcon, TrendUpIcon } from '../components/ui/icons'
import { InviteBlock } from '../components/ui/InviteBlock'
import { OptionRows } from '../components/ui/OptionRows'
import { RadioListGroup } from '../components/ui/RadioListGroup'
import { TextField } from '../components/ui/TextField'
import { type ExpenseSplit, SPLIT_OPTIONS } from '../features/household/preferences'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSession } from '../hooks/useSession'
import { ERROR_MESSAGES } from '../lib/errorMessages'
import { joinHousehold, normalizeInviteCode } from '../lib/inviteCode'
import { supabase } from '../lib/supabase'
import styles from './HouseholdSetup.module.css'

type CreateMode = 'individual' | 'pareja'
type Step = 'choose' | 'invite' | 'join' | 'preferences' | 'done'

/** Los tres recorridos (DESIGN.md § Onboarding). La barra se calcula sobre el elegido. */
const FLOWS: Record<CreateMode | 'join', Step[]> = {
  individual: ['choose', 'preferences'],
  pareja: ['choose', 'invite', 'preferences'],
  join: ['choose', 'join'],
}

/** El botón del pie del paso: envía el formulario del paso (atributo form). */
const FORM_ID = 'household-setup-step'

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
  onDone: () => void | Promise<void>
  /** Si una invitación pendiente (link/QR) falló al unir automáticamente. */
  joinError?: string | null
}

interface CtaProps {
  label: string
  busyLabel?: string
  busy?: boolean
  disabled?: boolean
  /** Sin onClick, envía el formulario del paso. */
  onClick?: () => void
}

/** Botón principal del paso: a todo el ancho, con flecha (DESIGN.md § Botones). */
function Cta({ label, busyLabel, busy, disabled, onClick }: CtaProps) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      form={onClick ? undefined : FORM_ID}
      className={styles.cta}
      disabled={disabled || busy}
      onClick={onClick}
    >
      <span>{busy && busyLabel ? busyLabel : label}</span>
      {!busy && <ArrowRightIcon aria-hidden="true" />}
    </button>
  )
}

export function HouseholdSetup({ onDone, joinError }: HouseholdSetupProps) {
  useDocumentTitle('Configura tu hogar')
  const { user } = useSession()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('choose')
  const [createMode, setCreateMode] = useState<CreateMode | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currency, setCurrency] = useState('CLP')
  const [expenseSplit, setExpenseSplit] = useState<ExpenseSplit | null>(null)

  // Solo se llenan tras crear el hogar de verdad. El código lo genera la base,
  // así que antes no hay nada que compartir: la invitación va en su propio paso,
  // después de crear (así nadie se une a un hogar que todavía no existe).
  const [createdHouseholdId, setCreatedHouseholdId] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [householdName, setHouseholdName] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)

  const isCouple = joined || createMode === 'pareja'
  const flow = step === 'join' || joined ? FLOWS.join : FLOWS[createMode ?? 'pareja']
  const progress = step === 'done' ? undefined : { step: flow.indexOf(step) + 1, total: flow.length }

  function goTo(next: Step) {
    setError(null)
    setStep(next)
  }

  /**
   * Volver desde el primer paso: dentro del onboarding no hay paso anterior,
   * así que se sale a la pantalla de registro. Cerrar la sesión es parte de
   * volver — sin eso /registro redirige de vuelta a la app.
   */
  async function handleBackToSignup() {
    await supabase.auth.signOut()
    navigate('/registro', { replace: true })
  }

  /**
   * En pareja el nombre lo escribe la persona; sola, no se le pregunta (un
   * hogar de una persona no necesita nombrarse para empezar) y se arma con su
   * nombre de perfil. Se puede cambiar después en Ajustes del hogar.
   */
  async function resolveHouseholdName(): Promise<string> {
    if (createMode === 'pareja') return name.trim()
    if (!user) return 'Mi hogar'

    // display_name sale de profiles y no de user_metadata: el trigger
    // handle_new_user ya resolvió ahí el nombre de Google/Apple o el del
    // formulario, con el correo como último recurso.
    const { data } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
    return data?.display_name ? `Hogar de ${data.display_name}` : 'Mi hogar'
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!user || !createMode) return
    setError(null)
    setSubmitting(true)

    const householdId = crypto.randomUUID()
    const householdLabel = await resolveHouseholdName()

    // Se genera el id en el cliente en vez de leerlo de vuelta con .select():
    // households_select_member solo deja ver un household del que ya eres
    // miembro, y justo al crearlo tu perfil todavía no está vinculado.
    const { error: insertError } = await supabase.from('households').insert({ id: householdId, name: householdLabel })

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
    setHouseholdName(householdLabel)
    // El hogar ya existe: en pareja primero se comparte el código; en
    // individual no hay con quién compartirlo y se va directo a la moneda.
    goTo(createMode === 'pareja' ? 'invite' : 'preferences')
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

    // Ya es miembro: puede leer el nombre del hogar para la pantalla final. Si
    // falla, la pantalla final lo dice sin el nombre.
    const { data } = await supabase.from('households').select('name').maybeSingle()
    setHouseholdName(data?.name ?? null)
    setJoined(true)
    setSubmitting(false)
    // El hogar ya existía (lo configuró la otra persona): no hay preferencias que pedir.
    goTo('done')
  }

  async function handlePreferences(event: FormEvent) {
    event.preventDefault()
    if (!createdHouseholdId) return
    if (createMode === 'pareja' && !expenseSplit) return
    setError(null)
    setSubmitting(true)

    const update: { currency: string; expense_split?: ExpenseSplit } = { currency }
    if (createMode === 'pareja' && expenseSplit) update.expense_split = expenseSplit

    const { error: prefsError } = await supabase
      .from('households')
      .update(update)
      .eq('id', createdHouseholdId)
      .select()
      .single()

    setSubmitting(false)
    if (prefsError) {
      console.error(prefsError)
      setError(ERROR_MESSAGES.save)
      return
    }
    goTo('done')
  }

  async function handleFinish() {
    setSubmitting(true)
    await onDone()
  }

  let screen: { title: string; helper?: string; onBack?: () => void; footer: ReactNode; body: ReactNode }

  if (step === 'invite' && inviteCode) {
    // Sin "Volver": el hogar ya está creado, volver al paso 1 crearía otro.
    screen = {
      title: 'Invita a tu pareja',
      helper: 'Puede sumarse cuando quiera con este código.',
      footer: <Cta label="Continuar" onClick={() => goTo('preferences')} />,
      body: <InviteBlock code={inviteCode} />,
    }
  } else if (step === 'join') {
    screen = {
      title: 'Ingresa el código',
      helper: 'Tu pareja lo encuentra en su app, en "Ver más" → "Invitar a tu pareja".',
      onBack: () => goTo('choose'),
      footer: (
        <Cta
          label="Unirme"
          busyLabel="Uniéndote…"
          busy={submitting}
          disabled={normalizeInviteCode(code).length !== 8}
        />
      ),
      body: (
        <form id={FORM_ID} className={styles.form} onSubmit={handleJoin}>
          <TextField
            label="Código de invitación"
            value={code}
            onChange={setCode}
            required
            autoComplete="off"
            placeholder="XXXX-XXXX"
            hint="¿No tienes código? Pídeselo a quien creó el hogar."
            variant="code"
          />
          {error && <FormError>{error}</FormError>}
        </form>
      ),
    }
  } else if (step === 'preferences') {
    screen = {
      title: createMode === 'pareja' ? 'Moneda y gastos' : 'Moneda',
      helper:
        createMode === 'pareja'
          ? 'Ajustaremos la app a como manejan el dinero.'
          : 'Elige la moneda con la que vas a trabajar. Puedes cambiarla después en Ajustes del hogar.',
      onBack: createMode === 'pareja' ? () => goTo('invite') : undefined,
      footer: (
        <Cta
          label="Empezar"
          busyLabel="Guardando…"
          busy={submitting}
          disabled={createMode === 'pareja' && !expenseSplit}
        />
      ),
      body: (
        <form id={FORM_ID} className={styles.form} onSubmit={handlePreferences}>
          <CurrencyPicker value={currency} onChange={setCurrency} />

          {createMode === 'pareja' && (
            <div className={styles.split}>
              <p className={styles.sectionLabel}>
                ¿Cómo prefieren repartir los gastos compartidos?
              </p>
              <RadioListGroup
                value={expenseSplit}
                onChange={setExpenseSplit}
                options={SPLIT_OPTIONS}
                label="¿Cómo prefieren repartir los gastos compartidos?"
              />
            </div>
          )}

          {error && <FormError>{error}</FormError>}
        </form>
      ),
    }
  } else if (step === 'done') {
    const subtitle = joined
      ? householdName
        ? `«${householdName}» ya está en tu app.`
        : 'Ya estás en el hogar de tu pareja.'
      : `«${householdName}» ya está configurado.`
    const features = isCouple
      ? [
          { Icon: BoltIcon, text: 'Registren cada gasto e ingreso juntos, en segundos' },
          { Icon: TrendUpIcon, text: 'Sigan su patrimonio compartido en tiempo real' },
          { Icon: TargetIcon, text: 'Pongan un presupuesto a cada categoría' },
        ]
      : [
          { Icon: BoltIcon, text: 'Registra cada gasto e ingreso en segundos' },
          { Icon: TrendUpIcon, text: 'Sigue tu patrimonio en tiempo real' },
          { Icon: TargetIcon, text: 'Pon un presupuesto a cada categoría' },
        ]

    return (
      <OnboardingLayout
        centered
        title={joined ? '¡Ya eres parte del hogar!' : 'Todo listo'}
        helper={subtitle}
        hero={<DoneHero />}
        footer={<Cta label="Ir a mi hogar" busyLabel="Entrando…" busy={submitting} onClick={handleFinish} />}
      >
        <ul className={styles.features} role="list">
          {features.map(({ Icon, text }) => (
            <li key={text} className={styles.feature}>
              <span className={styles.bubble}>
                <Icon aria-hidden="true" />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </OnboardingLayout>
    )
  } else {
    screen = {
      title: '¿Cómo vas a usar Twoney?',
      helper: 'Si empiezas por tu cuenta, podrás invitar a tu pareja más adelante.',
      onBack: handleBackToSignup,
      footer: (
        <Cta
          label="Continuar"
          busyLabel="Creando…"
          busy={submitting}
          disabled={!createMode || (createMode === 'pareja' && name.trim().length === 0)}
        />
      ),
      body: (
        <>
          {joinError && <FormError>{joinError}</FormError>}

          <form id={FORM_ID} className={styles.form} onSubmit={handleCreate}>
            <div className={styles.bleed}>
              <OptionRows
                value={createMode}
                onChange={setCreateMode}
                options={CREATE_MODE_OPTIONS}
                label="¿Cómo vas a usar Twoney?"
              />
            </div>

            {/* Solo en pareja: un hogar de una persona toma el nombre del perfil
                (ver resolveHouseholdName) y no hace falta preguntarlo. */}
            {createMode === 'pareja' && (
              <TextField
                label="Ponle nombre a tu hogar"
                value={name}
                onChange={setName}
                required
                placeholder="Ej. Casa Feliz"
                variant="underline"
              />
            )}

            {error && <FormError>{error}</FormError>}
          </form>

          <div className={styles.links}>
            <button type="button" className={styles.joinLink} onClick={() => goTo('join')}>
              ¿Ya tienes pareja? <span className={styles.joinAccent}>Únete a una</span>
            </button>
          </div>
        </>
      ),
    }
  }

  return (
    <OnboardingLayout progress={progress} title={screen.title} helper={screen.helper} onBack={screen.onBack} footer={screen.footer}>
      {screen.body}
    </OnboardingLayout>
  )
}

/**
 * Ilustración de la pantalla final con confeti (DESIGN.md § Transiciones,
 * excepciones: aparece con un leve rebote y después flota). Decorativa.
 */
function DoneHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <span className={`${styles.confetti} ${styles.c1}`} />
      <span className={`${styles.confetti} ${styles.c2}`} />
      <span className={`${styles.confetti} ${styles.c3}`} />
      <span className={`${styles.confetti} ${styles.c4}`} />
      <span className={`${styles.confetti} ${styles.c5}`} />
      <DoneIllustration className={styles.illustration} />
    </div>
  )
}
