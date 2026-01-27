import { Router } from 'express'
import { callDeepSeek } from '../services/deepseek'
import type { ChatRequest, ChatResponse, ErrorResponse } from '../types/index'

const router = Router()

/**
 * POST /api/dream-chat
 * 梦境解析聊天接口
 */
router.post('/dream-chat', async (req, res) => {
  const { question, userId } = req.body as ChatRequest

  // 参数验证
  if (!question) {
    return res.status(400).json({
      error: '问题不能为空',
    } satisfies ErrorResponse)
  }

  if (typeof question !== 'string') {
    return res.status(400).json({
      error: '问题必须是字符串',
    } satisfies ErrorResponse)
  }

  if (question.trim().length === 0) {
    return res.status(400).json({
      error: '问题不能为空',
    } satisfies ErrorResponse)
  }

  if (question.length > 500) {
    return res.status(400).json({
      error: '问题长度不能超过 500 字',
    } satisfies ErrorResponse)
  }

  // 记录请求
  console.log(
    `[Chat] Received question from ${userId || 'anonymous'}: "${question.substring(0, 50)}..."`
  )

  try {
    // 调用 DeepSeek API
    const answer = await callDeepSeek(question, userId)

    // 返回成功响应
    res.json({
      answer,
    } satisfies ChatResponse)
  } catch (error) {
    // 错误处理
    console.error('[Chat] Error processing request:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'AI 服务暂时不可用,请稍后重试'

    res.status(500).json({
      error: errorMessage,
    } satisfies ErrorResponse)
  }
})

export default router
