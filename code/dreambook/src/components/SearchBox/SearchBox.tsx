import { useState, useRef } from 'react'
import { useVirtualKeyboard } from '@/hooks/useVirtualKeyboard'
import styles from './SearchBox.module.css'

interface SearchBoxProps {
  onSearch?: (query: string) => void
  placeholder?: string
  maxLength?: number
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = '请描述你的梦境（人物、场景、感受等）......',
  maxLength = 100
}) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const virtualKeyboard = useVirtualKeyboard()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && onSearch) {
      onSearch(query.trim())
    }
  }

  // 处理点击事件，确保触摸屏设备弹出虚拟键盘
  const handleWrapperClick = (e: React.MouseEvent) => {
    // 如果点击的不是按钮，则聚焦到输入框
    const target = e.target as HTMLElement
    if (inputRef.current && !target.closest('button')) {
      // 对于触摸屏设备，使用 setTimeout 确保键盘弹出
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  // 处理触摸事件，确保虚拟键盘弹出
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    // 如果触摸的不是按钮，则聚焦到输入框
    if (inputRef.current && !target.closest('button')) {
      inputRef.current.focus()
      virtualKeyboard.onTouchStart()
    }
  }

  return (
    <form className={styles.searchBox} onSubmit={handleSubmit}>
      <div
        className={styles.inputWrapper}
        onClick={handleWrapperClick}
        onTouchStart={handleTouchStart}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          maxLength={maxLength}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={virtualKeyboard.onFocus}
          onClick={virtualKeyboard.onClick}
          onTouchEnd={virtualKeyboard.onTouchEnd}
        />
        <button type="submit" className={styles.searchButton}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          开始解析
        </button>
      </div>
      <div className={styles.charCount}>
        <span>{query.length}/{maxLength}</span>
        <span className={styles.charHint}>(最少3字，建议6字以上)</span>
      </div>
    </form>
  )
}
