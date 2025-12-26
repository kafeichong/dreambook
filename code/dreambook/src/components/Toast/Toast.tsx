import React, { useEffect, useState } from 'react'
import styles from './Toast.module.css'

interface ToastProps {
  message: string
  duration?: number
  onClose?: () => void
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  duration = 3000,
  onClose 
}) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        onClose?.()
      }, 300) // 等待淡出动画完成
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div className={styles.toast}>
      <div className={styles.content}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  )
}

