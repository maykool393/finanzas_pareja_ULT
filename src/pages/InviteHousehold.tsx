import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { InviteCodeBadge } from '../components/ui/InviteCodeBadge'
import { InviteQrCode } from '../components/ui/InviteQrCode'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useHousehold } from '../hooks/useHousehold'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import { formatInviteCode, inviteUrl } from '../lib/inviteCode'
import styles from './InviteHousehold.module.css'

export function InviteHousehold() {
  useDocumentTitle('Invitar a tu pareja')
  const { household } = useHousehold()
  const { members } = useHouseholdMembers()
  const [showQr, setShowQr] = useState(false)
  const code = household?.inviteCode ?? ''

  return (
    <div>
      <h1 className={styles.title}>Invitar a tu pareja</h1>
      <p className={styles.lead}>
        Comparte este código o el QR. Tu pareja lo usa al registrarse, o desde "¿Tienes un código? Únete aquí".
      </p>

      <div className={styles.codeRow}>
        <InviteCodeBadge code={formatInviteCode(code)} />
      </div>

      <div className={styles.qrToggle}>
        <Button type="button" variant="secondary" onClick={() => setShowQr((v) => !v)}>
          {showQr ? 'Ocultar QR' : 'Ver QR'}
        </Button>
        {showQr && code && <InviteQrCode url={inviteUrl(code)} />}
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
