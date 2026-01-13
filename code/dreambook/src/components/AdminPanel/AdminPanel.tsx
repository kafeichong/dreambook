/**
 * 管理员面板组件
 *
 * 功能：
 * - 刷新页面
 * - 重启应用
 * - 退出应用
 *
 * 风格：贴合梦境解析网站的梦幻粉紫风格
 */

import { CSSProperties } from 'react'

interface AdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

// 梦幻风格样式定义
const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 100000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    background: 'linear-gradient(135deg, rgba(30, 20, 50, 0.95) 0%, rgba(60, 30, 80, 0.95) 100%)',
    borderRadius: '24px',
    boxShadow: '0 0 40px rgba(255, 113, 172, 0.3), inset 0 0 60px rgba(255, 113, 172, 0.1)',
    width: '420px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 113, 172, 0.3)',
  },
  header: {
    background: 'linear-gradient(90deg, rgba(255, 113, 172, 0.4) 0%, rgba(180, 100, 255, 0.4) 100%)',
    padding: '20px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 113, 172, 0.2)',
  },
  title: {
    color: 'white',
    fontSize: '22px',
    fontWeight: 'bold',
    fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
    margin: 0,
    textShadow: '0 0 10px rgba(255, 113, 172, 0.5)',
  },
  closeButton: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '32px',
    lineHeight: 1,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  content: {
    padding: '28px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  button: {
    width: '100%',
    height: '56px',
    borderRadius: '28px',
    fontSize: '18px',
    fontWeight: 500,
    fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadButton: {
    background: 'rgba(100, 180, 255, 0.3)',
    border: '1px solid rgba(100, 180, 255, 0.6)',
    color: '#a0d8ff',
  },
  restartButton: {
    background: 'rgba(180, 140, 255, 0.3)',
    border: '1px solid rgba(180, 140, 255, 0.6)',
    color: '#d4c0ff',
  },
  exitButton: {
    background: 'rgba(255, 113, 172, 0.6)',
    border: '1px solid #FF0079',
    color: 'white',
  },
  switchUserButton: {
    background: 'rgba(255, 180, 100, 0.3)',
    border: '1px solid rgba(255, 180, 100, 0.6)',
    color: '#ffc080',
  },
  hint: {
    marginTop: '20px',
    textAlign: 'center' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
  },
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  // 刷新页面
  const handleReload = () => {
    window.location.reload()
  }

  // 重启应用
  const handleRestart = async () => {
    if (!window.electronAPI?.restartApp) {
      alert('重启功能仅在 Electron 环境下可用')
      return
    }

    if (confirm('确定要重启应用吗？')) {
      try {
        await window.electronAPI.restartApp()
      } catch (error) {
        console.error('重启失败:', error)
      }
    }
  }

  // 退出应用
  const handleExit = async () => {
    if (!window.electronAPI?.exitApp) {
      alert('退出功能仅在 Electron 环境下可用')
      return
    }

    if (confirm('确定要退出应用吗？')) {
      try {
        await window.electronAPI.exitApp()
      } catch (error) {
        console.error('退出失败:', error)
      }
    }
  }

  // 切换用户（Windows）
  const handleSwitchUser = async () => {
    if (!window.electronAPI?.switchUser) {
      alert('切换用户功能仅在 Windows Electron 环境下可用')
      return
    }

    if (confirm('确定要切换用户吗？应用将退出到登录界面。')) {
      try {
        await window.electronAPI.switchUser()
      } catch (error) {
        console.error('切换用户失败:', error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* 标题栏 */}
        <div style={styles.header}>
          <h2 style={styles.title}>管理面板</h2>
          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 113, 172, 0.4)'
              e.currentTarget.style.borderColor = 'rgba(255, 113, 172, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            ×
          </button>
        </div>

        <div style={styles.content}>
          {/* 操作按钮 */}
          <div style={styles.buttonGroup}>
            <button
              onClick={handleReload}
              style={{ ...styles.button, ...styles.reloadButton }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(100, 180, 255, 0.5)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(100, 180, 255, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(100, 180, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              刷新页面
            </button>
            <button
              onClick={handleRestart}
              style={{ ...styles.button, ...styles.restartButton }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(180, 140, 255, 0.5)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(180, 140, 255, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(180, 140, 255, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              重启应用
            </button>
            <button
              onClick={handleExit}
              style={{ ...styles.button, ...styles.exitButton }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 113, 172, 0.8)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 113, 172, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 113, 172, 0.6)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              退出应用
            </button>
            <button
              onClick={handleSwitchUser}
              style={{ ...styles.button, ...styles.switchUserButton }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 180, 100, 0.5)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 180, 100, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 180, 100, 0.3)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              切换用户
            </button>
          </div>

          {/* 提示 */}
          <p style={styles.hint}>
            点击右上角 × 关闭面板
          </p>
        </div>
      </div>
    </div>
  )
}
