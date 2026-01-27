/**
 * AI 服务封装
 *
 * 负责与后端 AI 接口通信
 */

interface ChatRequest {
  question: string
  userId?: string
}

interface ChatResponse {
  answer: string
}

interface ErrorResponse {
  error: string
}

/**
 * AI 服务类
 */
class AIService {
  private baseURL: string

  constructor() {
    // 优先级：
    // 1. 环境变量 VITE_API_URL (构建时配置)
    // 2. 当前域名 (window.location.origin)
    // 默认：http://localhost:3000 (开发时)

    const envUrl = import.meta.env.VITE_API_URL as string | undefined
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''

    this.baseURL = envUrl || currentOrigin || 'http://localhost:3000'
  }

  /**
   * 询问梦境解析
   *
   * @param question - 用户的梦境描述或问题
   * @param userId - 可选的用户ID
   * @returns AI 的回答
   */
  async askDream(question: string, userId?: string): Promise<string> {
    if (!question || question.trim().length === 0) {
      throw new Error('问题不能为空')
    }

    if (question.length > 500) {
      throw new Error('问题长度不能超过 500 字')
    }

    try {
      const requestBody: ChatRequest = { question }
      if (userId) {
        requestBody.userId = userId
      }

      const response = await fetch(`${this.baseURL}/api/dream-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.error || 'AI 服务暂时不可用,请稍后重试')
      }

      const data = (await response.json()) as ChatResponse
      return data.answer
    } catch (error) {
      if (error instanceof Error) {
        // 如果是我们抛出的错误,直接重新抛出
        if (error.message.includes('问题') || error.message.includes('AI 服务')) {
          throw error
        }

        // 网络错误
        if (error.message.includes('fetch') || error.name === 'TypeError') {
          throw new Error('网络连接失败，请检查网络连接或后端服务是否正常运行')
        }
      }

      // 未知错误
      throw new Error('AI 服务暂时不可用,请稍后重试')
    }
  }

  /**
   * 检查后端服务是否可用
   *
   * @returns 服务是否可用
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 获取后端服务状态
   *
   * @returns 服务状态信息
   */
  async getStatus(): Promise<{ status: string; timestamp: number; version?: string } | null> {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      if (!response.ok) return null

      return await response.json()
    } catch {
      return null
    }
  }
}

// 导出单例
export const aiService = new AIService()

// 默认导出
export default aiService
