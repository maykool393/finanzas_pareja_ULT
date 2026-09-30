import { useEffect, useState } from 'react'
import { formatInviteCode, inviteUrl } from '../../lib/inviteCode'
import { Dialog } from './Dialog'
import { ChatIcon, CheckIcon, CopyIcon, QrIcon } from './icons'
import styles from './InviteBlock.module.css'
import { InviteQrCode } from './InviteQrCode'

/** Lo que dura "Copiado" antes de volver a "Copiar". */
const COPIED_MS = 1600

/**
 * Código de invitación con sus tres formas de compartirlo (DESIGN.md §
 * Onboarding, bloque de invitación): copiar, WhatsApp y el QR en un diálogo.
 * Lo usan el paso de invitación del onboarding e "Invitar a tu pareja".
 */
export function InviteBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const formatted = formatInviteCode(code)
  const url = inviteUrl(code)
  const whatsappText = `Únete a nuestro hogar en Twoney con el código ${formatted}: ${url}`

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
    } catch (err) {
      // Sin permiso de portapapeles no hay nada que confirmar: el código sigue a la vista.
      console.error(err)
    }
  }

  return (
    <div className={styles.block}>
      <p className={`amount ${styles.code}`}>{formatted}</p>

      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={handleCopy}>
          {copied ? <CheckIcon className={styles.copiedIcon} aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
          <span>{copied ? 'Copiado' : 'Copiar'}</span>
        </button>

        <a
          className={styles.action}
          href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Globo de chat propio, no el logo de la marca (DESIGN.md § Iconografía). */}
          <ChatIcon aria-hidden="true" />
          <span>WhatsApp</span>
        </a>

        <button type="button" className={styles.action} onClick={() => setQrOpen(true)}>
          <QrIcon aria-hidden="true" />
          <span>Ver QR</span>
        </button>
      </div>

      {/* El cambio a "Copiado" se ve, pero un lector de pantalla no lo notaría. */}
      <p className="visually-hidden" aria-live="polite">
        {copied ? 'Código copiado' : ''}
      </p>

      <Dialog open={qrOpen} onClose={() => setQrOpen(false)} title="Código QR">
        <div className={styles.qr}>
          <InviteQrCode url={url} />
          <p className={styles.qrHint}>Compártelo para que tu pareja se una al hogar. Se abre con la cámara del teléfono.</p>
        </div>
      </Dialog>
    </div>
  )
}
