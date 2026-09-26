import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import styles from './InviteQrCode.module.css'

interface InviteQrCodeProps {
  url: string
}

/** QR del link de invitación (ver JoinRedirect) — se abre con cualquier cámara, no solo dentro de la app. */
export function InviteQrCode({ url }: InviteQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(url, { margin: 1, width: 220, color: { dark: '#1a1a1a', light: '#ffffff' } }).then((result) => {
      if (!cancelled) setDataUrl(result)
    })
    return () => {
      cancelled = true
    }
  }, [url])

  if (!dataUrl) return null

  return (
    <div className={styles.wrap}>
      <img src={dataUrl} alt={`Código QR para unirse a este hogar: ${url}`} width={220} height={220} />
    </div>
  )
}
