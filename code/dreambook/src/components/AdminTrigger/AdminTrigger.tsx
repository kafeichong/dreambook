/**
 * 管理员触发器组件
 *
 * 功能：
 * - 在屏幕右上角提供隐藏的触发区域
 * - 连续点击 5 次打开管理员面板
 */

import { useState, useCallback } from 'react'
import AdminPanel from '../AdminPanel/AdminPanel'

interface AdminTriggerProps {
  /** 触发点击次数，默认 5 */
  triggerClicks?: number
  /** 点击超时时间（毫秒），超过此时间重置计数，默认 2000 */
  clickTimeout?: number
}

export default function AdminTrigger({
  triggerClicks = 5,
  clickTimeout = 2000
}: AdminTriggerProps) {
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const now = Date.now()
    console.log('[AdminTrigger] 点击检测', { clickCount: clickCount + 1, triggerClicks })

    // 如果距离上次点击超过超时时间，重置计数
    if (now - lastClickTime > clickTimeout) {
      setClickCount(1)
      console.log('[AdminTrigger] 重置计数为 1')
    } else {
      const newCount = clickCount + 1
      setClickCount(newCount)
      console.log('[AdminTrigger] 计数增加到', newCount)

      // 达到触发次数，打开管理面板
      if (newCount >= triggerClicks) {
        console.log('[AdminTrigger] 达到触发次数，打开面板')
        setIsPanelOpen(true)
        setClickCount(0)
      }
    }

    setLastClickTime(now)
  }, [clickCount, lastClickTime, clickTimeout, triggerClicks])

  return (
    <>
      {/* 隐藏的触发区域 - 右上角 */}
      <div
        onClick={handleClick}
        onTouchEnd={handleClick}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          zIndex: 99999,
          cursor: 'default',
          userSelect: 'none',
          // 调试时可以取消下面的注释来看到触发区域
          // backgroundColor: 'rgba(255, 0, 0, 0.3)',
        }}
      />

      {/* 管理员面板 */}
      <AdminPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  )
}
