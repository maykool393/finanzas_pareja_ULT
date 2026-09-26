import { useState } from 'react'
import { CopyIcon } from './icons'
import styles from './InviteCodeBadge.module.css'

interface InviteCodeBadgeProps {
  code: string
}

/** Código de vinculación de hogar + copiar — usado en HouseholdSetup e InviteHousehold. */
export function InviteCodeBadge({ code }: InviteCodeBadgeProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.row}>
      <span className={styles.badge} title={code}>
        {code}
      </span>
      <button type="button" className={styles.copyBtn} onClick={handleCopy}>
        <CopyIcon width={14} height={14} />
        <span>{copied ? 'Copiado' : 'Copiar'}</span>
      </button>
    </div>
  )
}
