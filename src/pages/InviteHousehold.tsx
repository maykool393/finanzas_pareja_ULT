import { useState } from 'react'
import { useHouseholdId } from '../hooks/useHouseholdId'
import { useHouseholdMembers } from '../hooks/useHouseholdMembers'
import styles from './InviteHousehold.module.css'

export function InviteHousehold() {
  const { householdId } = useHouseholdId()
  const { members } = useHouseholdMembers()
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    if (!householdId) return
    await navigator.clipboard.writeText(householdId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <h1 className={styles.title}>Invitar a tu pareja</h1>
      <p className={styles.lead}>
        Comparte este código — lo pega en "¿Tu pareja ya tiene un espacio?" al registrarse.
      </p>

      <div className={styles.codeRow}>
        <input className={styles.code} readOnly value={householdId ?? ''} onFocus={(e) => e.target.select()} />
        <button type="button" className={styles.copy} onClick={copyCode}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
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
