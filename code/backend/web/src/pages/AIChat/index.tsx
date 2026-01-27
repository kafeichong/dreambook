import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { ParticleBackground } from '@components/ParticleBackground'
import { getAssetPath } from '@utils/assetPath'
import { aiService } from '@/services/aiService'
import { useVirtualKeyboard } from '@/hooks/useVirtualKeyboard'
import './index.css'

export function AIChat() {
  const navigate = useNavigate()
  const location = useLocation()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const virtualKeyboard = useVirtualKeyboard()

  // 从路由 state 中获取传递过来的问题
  useEffect(() => {
    const state = location.state as { question?: string }
    if (state?.question) {
      setQuestion(state.question)
      // 自动开始解析
      handleAsk(state.question)
    }
  }, [location.state])

  const handleAsk = async (q: string) => {
    if (!q.trim()) {
      setError('请输入你的梦境描述')
      return
    }

    setLoading(true)
    setError('')
    setAnswer('')

    try {
      const result = await aiService.askDream(q)
      setAnswer(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI 服务暂时不可用,请稍后重试'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleAsk(question)
  }

  const handleClear = () => {
    setQuestion('')
    setAnswer('')
    setError('')
  }

  return (
    <div className="ai-chat-page">
      {/* 粒子背景 - 和首页相同 */}
      <ParticleBackground
        backgroundImage={getAssetPath('/assets/backgrounds/index_bg.webp')}
        particleCount={150}
        particleColor="hsl(180, 100%, 80%)"
      />

      {/* 返回按钮 - 移到右下角 */}
    

      <div className="ai-chat-container">
        <div className="ai-chat-wrapper">
          {/* 标题区域 */}
          <div className="chat-header">
            <h1 className="chat-title">AI 梦境解析</h1>
            <p className="chat-subtitle">描述你的梦境,让 AI 为你解析</p>
          </div>

          {/* 输入区域 */}
          <form className="chat-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <textarea
                className="dream-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onFocus={virtualKeyboard.onFocus}
                onClick={virtualKeyboard.onClick}
                onTouchStart={virtualKeyboard.onTouchStart}
                onTouchEnd={virtualKeyboard.onTouchEnd}
                placeholder="请描述你的梦境...&#10;&#10;例如:我梦见自己在天空中飞翔,感觉非常自由..."
                rows={6}
                maxLength={500}
                disabled={loading}
              />
              <div className="char-count">{question.length} / 500</div>
            </div>

            <div className="button-group">
              <button type="submit" className="submit-button" disabled={loading || !question.trim()}>
                {loading ? '解析中...' : '开始解析'}
              </button>
              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
                disabled={loading}
              >
                清空
              </button>
            </div>
          </form>

          {/* 加载状态 */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p className="loading-text">AI 正在为你解析梦境,请稍候...</p>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error}</p>
            </div>
          )}

          {/* 回答展示 */}
          {answer && !loading && (
            <div className="answer-container">
              <h2 className="answer-title">AI 解析结果</h2>
              <div className="answer-content">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
              <div className="answer-footer">
                <p className="disclaimer">
                  *
                  以上解读仅供参考,不代表现实会发生什么,也不能替代专业医疗或心理帮助
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
