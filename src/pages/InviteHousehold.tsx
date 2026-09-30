import { HouseholdAvatars } from '../components/ui/HouseholdAvatars'
import { InviteBlock } from '../components/ui/InviteBlock'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHousehold } from '../hooks/useHousehold'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import styles from './InviteHousehold.module.css'

export function InviteHousehold() {
  useDocumentTitle('Invitar a tu pareja')
  const { household } = useHousehold()
  const { members } = useHouseholdMembers()

  return (
    <div>
      <h1 className={styles.title}>Invitar a tu pareja</h1>
      <p className={styles.lead}>
        Tu pareja lo escribe al configurar su cuenta, en "¿Ya tienes pareja? Únete a una", o escanea el QR con la
        cámara del teléfono.
      </p>

      {household && (
        <div className={styles.block}>
          <InviteBlock code={household.inviteCode} />
        </div>
      )}

      <p className={`label ${styles.membersLabel}`}>Miembros</p>
      <ul className={styles.members} role="list">
        {members.map((member) => (
          <li key={member.id} className={styles.member}>
            <HouseholdAvatars members={members} ownerId={member.id} ring="var(--surface-card)" />
            {member.displayName}
          </li>
        ))}
      </ul>
    </div>
  )
}
