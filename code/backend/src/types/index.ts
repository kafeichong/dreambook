/**
 * 聊天请求接口
 */
export interface ChatRequest {
  question: string
  userId?: string
}

/**
 * 聊天响应接口
 */
export interface ChatResponse {
  answer: string
}

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  error: string
}

/**
 * DeepSeek 消息接口
 */
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * DeepSeek 请求接口
 */
export interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature: number
  max_tokens: number
  user?: string
}

/**
 * DeepSeek 响应接口
 */
export interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
