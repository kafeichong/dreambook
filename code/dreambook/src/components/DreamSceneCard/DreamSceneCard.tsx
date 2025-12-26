import { useRef, useEffect } from 'react'
import styles from './DreamSceneCard.module.css'

interface DreamSceneCardProps {
  id: string
  number: number
  title: string
  mainTitle?: string
  displaySubtitle?: string
  image: string
  onClick?: () => void
  animationDelay?: number
}

export const DreamSceneCard: React.FC<DreamSceneCardProps> = ({
  number,
  title,
  mainTitle,
  displaySubtitle,
  image,
  onClick,
  animationDelay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.animationDelay = `${animationDelay}s`
    }
  }, [animationDelay])

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className={styles.imageContainer}>
        <img
          src={image}
          alt={title}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.titleGroup}>
          <span className={styles.number}>{number.toString().padStart(2, '0')}.</span>
          <h3 className={styles.mainTitle}>{mainTitle || title}</h3>
        </div>
        <p className={styles.displaySubtitle}>({displaySubtitle || title})</p>
      </div>
    </div>
  )
}
