import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { InviteCodeBadge } from '../components/ui/InviteCodeBadge'
import { InviteQrCode } from '../components/ui/InviteQrCode'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHouseholdId } from '../hooks/useHouseholdId'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import styles from './InviteHousehold.module.css'

export function InviteHousehold() {
  useDocumentTitle('Invitar a tu pareja')
  const { householdId } = useHouseholdId()
  const { members } = useHouseholdMembers()
  const [showQr, setShowQr] = useState(false)
  const inviteUrl = `${window.location.origin}/unirse/${householdId ?? ''}`

  return (
    <div>
      <h1 className={styles.title}>Invitar a tu pareja</h1>
      <p className={styles.lead}>
        Comparte este código o el QR. Tu pareja lo usa al registrarse o desde "¿Tienes un código? Únete aquí".
      </p>

      <div className={styles.codeRow}>
        <InviteCodeBadge code={householdId ?? ''} />
      </div>

      <div className={styles.qrToggle}>
        <Button type="button" variant="secondary" onClick={() => setShowQr((v) => !v)}>
          {showQr ? 'Ocultar QR' : 'Ver QR'}
        </Button>
        {showQr && <InviteQrCode url={inviteUrl} />}
      </div>

      <p className={`label ${styles.membersLabel}`}>Miembros</p>
      <div className={styles.members}>
        {members.map((member) => (
          <div key={member.id} className={styles.member}>
            {member.displayName}
          </div>
        ))}
      </div>
    </div>
  )
}
