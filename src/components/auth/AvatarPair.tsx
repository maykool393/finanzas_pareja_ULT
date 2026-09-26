import { HeartFilledIcon, PersonFilledIcon } from '../ui/icons'
import styles from './AvatarPair.module.css'

/** Par de avatares + corazón — acento decorativo de los flujos de onboarding "en pareja". */
export function AvatarPair() {
  return (
    <div className={styles.row} aria-hidden="true">
      <span className={`${styles.avatar} ${styles.pink}`}>
        <PersonFilledIcon width={28} height={28} />
      </span>
      <span className={styles.heart}>
        <HeartFilledIcon width={15} height={15} />
      </span>
      <span className={`${styles.avatar} ${styles.blue}`}>
        <PersonFilledIcon width={28} height={28} />
      </span>
    </div>
  )
}
