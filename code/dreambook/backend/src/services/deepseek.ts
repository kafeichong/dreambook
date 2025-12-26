import { config } from '../config'
import { DREAM_SYSTEM_PROMPT } from '../prompts/system'
import type { DeepSeekRequest, DeepSeekResponse } from '../types/index'

/**
 * 调用 DeepSeek API 进行梦境解析
 *
 * @param question - 用户的梦境描述或问题
 * @param userId - 可选的用户ID,用于API跟踪
 * @returns AI 的回答内容
 * @throws 当API调用失败时抛出错误
 */
export async function callDeepSeek(
  question: string,
  userId?: string
): Promise<string> {
  // 构建请求体
  const requestBody: DeepSeekRequest = {
    model: config.deepseek.model,
    messages: [
      {
        role: 'system',
        content: DREAM_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    temperature: config.deepseek.temperature,
    max_tokens: config.deepseek.maxTokens,
  }

  // 如果提供了用户ID,添加到请求中
  if (userId) {
    requestBody.user = userId
  }

  console.log(`[DeepSeek] Calling API for question: "${question.substring(0, 50)}..."`)

  try {
    // 创建 AbortController 用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.deepseek.timeout)

    // 调用 DeepSeek API
    const response = await fetch(`${config.deepseek.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.deepseek.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[DeepSeek] API error: ${response.status} ${response.statusText}`)
      console.error(`[DeepSeek] Error details: ${errorText}`)

      if (response.status === 401) {
        throw new Error('DeepSeek API Key 无效,请检查配置')
      } else if (response.status === 429) {
        throw new Error('DeepSeek API 请求过于频繁,请稍后重试')
      } else if (response.status >= 500) {
        throw new Error('DeepSeek 服务暂时不可用,请稍后重试')
      } else {
        throw new Error(`DeepSeek API 错误: ${response.status}`)
      }
    }

    // 解析响应
    const data = (await response.json()) as DeepSeekResponse

    // 提取回答内容
    const answer = data.choices?.[0]?.message?.content

    if (!answer) {
      console.error('[DeepSeek] Invalid response structure:', data)
      throw new Error('DeepSeek API 返回了无效的响应')
    }

    // 记录使用情况
    if (data.usage) {
      console.log(
        `[DeepSeek] Tokens used: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`
      )
    }

    console.log(`[DeepSeek] Response received: "${answer.substring(0, 100)}..."`)

    return answer
  } catch (error) {
    // 处理超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[DeepSeek] Request timeout')
      throw new Error('DeepSeek API 请求超时,请稍后重试')
    }

    // 处理网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[DeepSeek] Network error:', error)
      throw new Error('网络连接失败,请检查网络设置')
    }

    // 重新抛出其他错误
    throw error
  }
}

/**
 * 测试 DeepSeek API 连接
 *
 * @returns 是否连接成功
 */
export async function testDeepSeekConnection(): Promise<boolean> {
  try {
    await callDeepSeek('测试连接')
    return true
  } catch (error) {
    console.error('[DeepSeek] Connection test failed:', error)
    return false
  }
}
