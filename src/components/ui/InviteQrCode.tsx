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
    // La librería se carga recién al pedir el QR: solo se usa al tocar
    // "Ver QR" y no tiene por qué viajar en la carga inicial de la app.
    import('qrcode')
      .then(({ default: QRCode }) =>
        // margin: 4 = la zona de silencio que pide la especificación de QR.
        // El margen blanco va dentro de la imagen, así no hace falta una caja
        // alrededor (sería una tarjeta dentro de otra) y se escanea igual
        // sobre la tarjeta oscura.
        QRCode.toDataURL(url, { margin: 4, width: 220, color: { dark: '#1a1a1a', light: '#ffffff' } }),
      )
      .then((result) => {
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
