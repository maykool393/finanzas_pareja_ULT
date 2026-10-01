import { useRef } from 'react'
import { Button } from '../../components/ui/Button'
import { HouseholdAvatars } from '../../components/ui/HouseholdAvatars'
import { CheckIcon, MoneyIcon } from '../../components/ui/icons'
import { PercentPill } from '../../components/ui/PercentPill'
import { formatCurrency } from '../../lib/format'
import type { Profile } from '../../types/domain'
import styles from './SharedStory.module.css'
import frame from './Stories.module.css'
import { type SharedSummary, splitPercents } from './summary'
import { useCountUp } from './useCountUp'

/** Semicírculo en el viewBox de 200 × 118: radio 80, trazo 17. */
const HALF = Math.PI * 80
/** Espacio entre los arcos: los extremos redondeados ocupan 8.5 cada uno; quedan 6 visibles. */
const GAP = 17 + 6
const LEFT_TO_RIGHT = 'M 20 98 A 80 80 0 0 1 180 98'
const RIGHT_TO_LEFT = 'M 180 98 A 80 80 0 0 0 20 98'

/** Color de cada persona: el primero en registrarse es la "a" (DESIGN.md § Personas del hogar). */
const PERSON_COLORS = ['var(--brand)', 'var(--person-b)']

const firstName = (member: Profile) => member.displayName.trim().split(/\s+/)[0] || member.displayName

interface SharedStoryProps {
  summary: SharedSummary
  members: Profile[]
  currency: string
  monthName: string
  /** Hubo saldos este mes (aunque ya no quede nada pendiente). */
  hasSettlements: boolean
  onSettle: () => void
}

/**
 * Historia 2 (oscura en ambos modos): cuánto le tocaba a cada uno de los
 * gastos compartidos, cuánto pagó, y quién le debe a quién.
 */
export function SharedStory({ summary, members, currency, monthName, hasSettlements, onSettle }: SharedStoryProps) {
  const { debt, people, total } = summary
  const pending = debt?.amount ?? 0
  const pendingRef = useRef<HTMLSpanElement>(null)
  useCountUp(pendingRef, pending, (value) => formatCurrency(value, currency))

  const percents = splitPercents(people[0].ratio)
  const arcA = Math.max(people[0].ratio * HALF - GAP / 2, 0.01)
  const arcB = Math.max(people[1].ratio * HALF - GAP / 2, 0.01)

  let status: string
  if (debt) status = `${firstName(debt.from)} le debe a ${firstName(debt.to)}`
  else if (hasSettlements) status = 'Saldado'
  else if (total === 0) status = `Sin gastos compartidos en ${monthName}`
  else status = 'Están a mano'

  return (
    <>
      <div className={styles.center}>
        <svg
          className={frame.pop}
          width="215"
          height="127"
          viewBox="0 0 200 118"
          role="img"
          aria-label={`De los gastos compartidos, a ${firstName(people[0].member)} le toca el ${percents[0]} % y a ${firstName(people[1].member)} el ${percents[1]} %.`}
        >
          <path d={LEFT_TO_RIGHT} className={styles.arc} style={{ stroke: PERSON_COLORS[0] }} strokeDasharray={`${arcA} 1000`} />
          <path d={RIGHT_TO_LEFT} className={styles.arc} style={{ stroke: PERSON_COLORS[1] }} strokeDasharray={`${arcB} 1000`} />
        </svg>

        <div className={styles.status}>
          <span className={styles.label}>Por saldar</span>
          <span ref={pendingRef} className={`amount ${styles.pending}`} aria-hidden="true" />
          {/* Solo el monto: "Por saldar" ya se lee arriba. */}
          <span className="visually-hidden">{formatCurrency(pending, currency)}.</span>
          <span className={styles.line}>
            {!debt && hasSettlements && <CheckIcon className={styles.check} aria-hidden="true" />}
            {status}
          </span>
          {summary.settled > 0 && (
            <span className={styles.note}>Transferido este mes: {formatCurrency(summary.settled, currency)}</span>
          )}
        </div>
      </div>

      <div className={styles.cards}>
        {people.map((person, i) => (
          <div key={person.member.id} className={styles.card}>
            <div className={styles.cardTop}>
              <HouseholdAvatars members={members} ownerId={person.member.id} size={25} ring="transparent" />
              <span className={styles.name}>{firstName(person.member)}</span>
              <PercentPill value={`${percents[i]} %`} tint={PERSON_COLORS[i]} />
            </div>
            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt>Le tocaba</dt>
                <dd className="amount">{formatCurrency(person.share, currency)}</dd>
              </div>
              <div className={styles.row}>
                <dt>Pagó</dt>
                <dd className="amount">{formatCurrency(person.paid, currency)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {summary.missingIncome.length > 0 && (
        <p className={styles.note}>
          {summary.missingIncome.map(firstName).join(' y ')}{' '}
          {summary.missingIncome.length === 1 ? 'no registró' : 'no registraron'} ingresos en {monthName}: se reparte 50 / 50.
        </p>
      )}

      {debt && (
        <Button variant="onDark" className={styles.settle} onClick={onSettle}>
          <MoneyIcon aria-hidden="true" />
          Saldar
        </Button>
      )}
    </>
  )
}
