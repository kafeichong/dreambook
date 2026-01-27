import express from 'express'
import cors from 'cors'
import { config, validateConfig } from './config'
import chatRouter from './routes/chat'

/**
 * 梦境解析后端服务
 */

// 验证配置
try {
  validateConfig()
} catch (error) {
  console.error('配置验证失败:', error)
  process.exit(1)
}

// 创建 Express 应用
const app = express()

// 中间件
app.use(cors(config.cors))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  })
})

// API 路由
app.use('/api', chatRouter)

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  })
})

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err)

  res.status(500).json({
    error: '服务器内部错误',
    message: config.env === 'development' ? err.message : undefined,
  })
})

// 启动服务器
const server = app.listen(config.port, () => {
  console.log('='.repeat(50))
  console.log('🚀 梦境解析后端服务已启动')
  console.log('='.repeat(50))
  console.log(`📍 地址: http://localhost:${config.port}`)
  console.log(`🌍 环境: ${config.env}`)
  console.log(`🔑 API Key: ${config.deepseek.apiKey ? '已配置' : '未配置'}`)
  console.log('='.repeat(50))
  console.log('')
  console.log('可用接口:')
  console.log(`  GET  /health          - 健康检查`)
  console.log(`  POST /api/dream-chat  - 梦境解析`)
  console.log('')
  console.log('按 Ctrl+C 停止服务')
  console.log('='.repeat(50))
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n收到 SIGTERM 信号,正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('\n收到 SIGINT 信号,正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})
