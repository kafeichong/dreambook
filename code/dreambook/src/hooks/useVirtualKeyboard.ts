/**
 * 虚拟键盘 Hook
 * 用于 Windows 触摸屏设备上自动弹出系统虚拟键盘
 */

import { useCallback, useEffect, useRef } from 'react'

/**
 * 显示虚拟键盘（带调试日志）
 */
const showKeyboard = (context: string) => {
  console.log(`[虚拟键盘] 尝试显示键盘 - 触发位置: ${context}`)

  if (window.electronAPI) {
    console.log(`[虚拟键盘] electronAPI 存在, 平台: ${window.electronAPI.platform}`)

    if (window.electronAPI.platform === 'win32') {
      console.log(`[虚拟键盘] 调用 showVirtualKeyboard()`)

      window.electronAPI.showVirtualKeyboard()
        .then(result => {
          console.log(`[虚拟键盘] 调用成功, 结果: ${result}`)
        })
        .catch(error => {
          console.error(`[虚拟键盘] 调用失败:`, error)
        })
    } else {
      console.log(`[虚拟键盘] 非 Windows 平台，跳过`)
    }
  } else {
    console.log(`[虚拟键盘] electronAPI 不存在，可能在浏览器环境中运行`)
  }
}

/**
 * 虚拟键盘 Hook
 *
 * 使用方法：
 * ```tsx
 * const { onFocus, onClick, onTouchStart, onTouchEnd } = useVirtualKeyboard()
 *
 * <input
 *   onFocus={onFocus}
 *   onClick={onClick}
 *   onTouchStart={onTouchStart}
 *   onTouchEnd={onTouchEnd}
 * />
 * ```
 */
export function useVirtualKeyboard() {
  // 防抖控制
  const lastCallTime = useRef(0)
  const DEBOUNCE_DELAY = 500 // 500ms 内不重复调用

  const shouldCallKeyboard = useCallback(() => {
    const now = Date.now()
    if (now - lastCallTime.current > DEBOUNCE_DELAY) {
      lastCallTime.current = now
      return true
    }
    console.log(`[虚拟键盘] 防抖：跳过重复调用`)
    return false
  }, [])

  /**
   * 焦点事件处理器
   */
  const handleFocus = useCallback(() => {
    if (!shouldCallKeyboard()) return

    console.log(`[虚拟键盘] ===== Focus 事件触发 =====`)

    // 稍微延迟一下，确保焦点事件完成
    setTimeout(() => {
      showKeyboard('focus')
    }, 100)
  }, [shouldCallKeyboard])

  /**
   * 点击事件处理器
   */
  const handleClick = useCallback(() => {
    console.log(`[虚拟键盘] ===== Click 事件触发 =====`)

    // 立即尝试显示键盘
    setTimeout(() => {
      showKeyboard('click')
    }, 50)
  }, [])

  /**
   * 触摸开始事件处理器
   */
  const handleTouchStart = useCallback(() => {
    console.log(`[虚拟键盘] ===== TouchStart 事件触发 =====`)

    // 触摸开始时立即尝试
    showKeyboard('touchStart')
  }, [])

  /**
   * 触摸结束事件处理器
   *
   * 有些触摸屏设备在 touchend 时才真正触发焦点，
   * 所以这里也尝试调用
   */
  const handleTouchEnd = useCallback(() => {
    if (!shouldCallKeyboard()) return

    console.log(`[虚拟键盘] ===== TouchEnd 事件触发 =====`)

    // 稍微延迟，等待焦点真正获取
    setTimeout(() => {
      showKeyboard('touchEnd')
    }, 150)
  }, [shouldCallKeyboard])

  /**
   * 页面加载时输出调试信息
   */
  useEffect(() => {
    console.log(`[虚拟键盘] Hook 初始化`)
    console.log(`[虚拟键盘] electronAPI 存在: ${!!window.electronAPI}`)
    if (window.electronAPI) {
      console.log(`[虚拟键盘] 平台: ${window.electronAPI.platform}`)
    }
  }, [])

  return {
    onFocus: handleFocus,
    onClick: handleClick,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }
}
