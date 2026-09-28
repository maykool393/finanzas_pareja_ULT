import type { CSSProperties } from 'react'
import type { Profile } from '../../types/domain'
import styles from './HouseholdAvatars.module.css'

/**
 * Siempre dos letras, para distinguir a dos personas con la misma inicial:
 * nombre y apellido ("Mery Farías" → "MF"), o las dos primeras letras si solo
 * hay un nombre ("Mery" → "ME").
 */
function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length >= 2 ? words[0].charAt(0) + words[1].charAt(0) : (words[0] ?? '').slice(0, 2)
  return letters.toUpperCase()
}

interface HouseholdAvatarsProps {
  /** Miembros del hogar en orden de registro (useHouseholdMembers ya los ordena). */
  members: Profile[]
  /** De quién es: un id muestra su avatar; null (compartido) muestra los de todos. */
  ownerId: string | null
  size?: 24 | 25 | 28
  /** Color del anillo: el de la superficie de atrás, para separar los avatares solapados. */
  ring?: string
}

/**
 * Avatares con iniciales sobre el color de cada persona (DESIGN.md § Personas
 * del hogar). Decorativos: quien los usa nombra al dueño en su propio texto
 * accesible (ej. el aria-label de ItemCard).
 */
export function HouseholdAvatars({ members, ownerId, size = 28, ring = 'var(--avatar-ring)' }: HouseholdAvatarsProps) {
  const shown = ownerId ? members.filter((m) => m.id === ownerId) : members
  if (shown.length === 0) return null

  return (
    <span className={styles.row} style={{ '--avatar-size': `${size}px`, '--ring': ring } as CSSProperties} aria-hidden="true">
      {shown.map((member) => {
        const tone = members.indexOf(member) === 0 ? styles.personA : styles.personB
        return (
          <span key={member.id} className={`${styles.avatar} ${tone}`}>
            {initials(member.displayName)}
          </span>
        )
      })}
    </span>
  )
}
