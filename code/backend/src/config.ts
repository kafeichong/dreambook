import { config as dotenvConfig } from 'dotenv'

// 只在开发环境加载 .env 文件
// 生产环境（Electron 打包后）从 main.ts 传入的环境变量读取
const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) {
  // 开发环境：加载 .env 文件
  dotenvConfig()
  console.log('[Config] 已加载 .env 文件 (开发模式)')
} else {
  // 生产环境：使用 Electron main.ts 传入的环境变量
  console.log('[Config] 使用环境变量 (生产模式)')
}

/**
 * 应用配置
 */
export const config = {
  // 服务配置
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',

  // DeepSeek API 配置
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 600,
    timeout: 15000, // 15秒超时
  },

  // CORS 配置
  cors: {
    origin: [
      'http://localhost:5173', // Vite 开发服务器
      'http://localhost:5174',
      'file://*', // Electron 环境
    ],
    credentials: true,
  },
}

/**
 * 验证配置
 */
export function validateConfig(): void {
  const errors: string[] = []

  if (!config.deepseek.apiKey) {
    errors.push('DEEPSEEK_API_KEY is not set')
  }

  if (config.deepseek.apiKey && !config.deepseek.apiKey.startsWith('sk-')) {
    errors.push('DEEPSEEK_API_KEY format is invalid (should start with "sk-")')
  }

  if (errors.length > 0) {
    console.warn('⚠️  Configuration warnings:')
    errors.forEach((error) => console.warn(`   - ${error}`))

    if (config.env === 'production') {
      throw new Error('Configuration validation failed in production mode')
    }
  } else {
    console.log('✅ Configuration validated successfully')
  }
}
