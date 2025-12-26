# 梦境解析应用 - AI 功能后端架构方案

## 文档信息
- **项目名称**: 梦境解析触摸屏应用
- **文档版本**: v1.0
- **创建日期**: 2025-12-12
- **文档类型**: 技术方案设计

---

## 一、项目背景

### 1.1 项目概述
梦境解析是一个运行在图书馆触摸屏上的 Electron 桌面应用，用于帮助用户理解和解析梦境。

### 1.2 当前技术栈
- **前端**: React 19 + Vite + TypeScript
- **动画**: GSAP + Three.js
- **打包**: Electron 33
- **运行环境**: Win10 触摸屏（1920x1080）
- **部署方式**: 离线打包为 .exe 可执行文件

### 1.3 项目目录结构
```
dreambook/
├── src/                    # React 前端代码
│   ├── pages/             # 页面组件
│   ├── components/        # UI 组件
│   ├── hooks/             # React Hooks
│   └── utils/             # 工具函数
├── electron/              # Electron 主进程代码
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
├── docs/                  # 项目文档
└── package.json
```

### 1.4 核心需求
需要在现有应用中添加 AI 解梦功能：
- 用户输入梦境描述
- AI 给出心理学角度的解析和建议
- 不做医疗诊断，不做算命预测
- 提供温和、理性的回答

### 1.5 运行环境特点
- ✅ 有网络连接（图书馆网络）
- ✅ 专机专用（仅一台触摸屏运行）
- ✅ Win10 系统
- ✅ 离线部署，无需实时更新

---

## 二、技术方案对比

### 2.1 方案一：Electron + 本地 Node 后端 ⭐ 推荐

#### 架构图
```
触摸屏机器（Win10 本地）
┌─────────────────────────────────────┐
│  Electron 应用（梦境解析.exe）      │
│  ┌───────────────────────────────┐  │
│  │  React 前端                   │  │
│  │  (运行在 Electron 窗口)       │  │
│  └─────────┬─────────────────────┘  │
│            │ HTTP                    │
│            │ localhost:3000          │
│            ↓                         │
│  ┌───────────────────────────────┐  │
│  │  Node.js 后端服务             │  │
│  │  (Electron 启动的子进程)      │  │
│  │  - Express 框架               │  │
│  │  - DeepSeek API 调用          │  │
│  │  - System Prompt 管理         │  │
│  └─────────┬─────────────────────┘  │
└────────────┼─────────────────────────┘
             │ HTTPS
             │ 通过图书馆网络
             ↓
      ☁️  DeepSeek API (云端)
```

#### 优点
- ✅ 零服务器成本（无需购买云服务器）
- ✅ 部署简单（一个 .exe 文件包含所有）
- ✅ 性能最优（后端在本地，无网络延迟）
- ✅ 安全可控（API Key 存储在本地）
- ✅ 易于维护（单机部署，双击启动）
- ✅ 职责清晰（前后端分离）
- ✅ 易于扩展（后续可加 RAG、缓存等）

#### 缺点
- ❌ 打包复杂度略高（需打包后端代码）
- ❌ 需要网络连接（已确认有网络，不是问题）
- ❌ API Key 需妥善管理

#### 适用场景
- ✅ 专机专用（单台设备）
- ✅ 有稳定网络
- ✅ 无服务器预算
- ✅ 需要离线部署

---

### 2.2 方案二：Electron IPC + 主进程调用

#### 架构图
```
React 组件
    ↓ IPC Renderer
Electron 主进程
    ↓ HTTPS
DeepSeek API
```

#### 优点
- ✅ 无需独立后端服务
- ✅ Electron 原生支持
- ✅ 代码量少

#### 缺点
- ❌ 主进程不适合复杂业务逻辑
- ❌ API Key 暴露在 Electron 代码中（相对不安全）
- ❌ 难以扩展和维护
- ❌ 不符合前后端分离原则

#### 结论
不推荐，仅适合简单场景。

---

### 2.3 方案三：独立云服务器后端

#### 架构图
```
触摸屏 Electron App (纯前端)
         ↓ HTTPS
你的云服务器（阿里云/腾讯云）
  - Node.js 后端服务
         ↓ HTTPS
    DeepSeek API
```

#### 优点
- ✅ 多台设备可共享后端
- ✅ 便于统一管理和更新
- ✅ 传统架构，团队熟悉

#### 缺点
- ❌ 需要购买服务器（每月 50-100 元）
- ❌ 需要运维（域名、SSL、备案等）
- ❌ 增加网络延迟
- ❌ 对单机场景过度设计

#### 结论
不推荐，仅有一台设备时完全没必要。

---

### 2.4 方案四：内嵌本地 LLM

#### 说明
使用 Ollama 或 llama.cpp 运行本地大模型（如 Llama 3）

#### 优点
- ✅ 完全离线运行
- ✅ 无 API 成本

#### 缺点
- ❌ 打包体积巨大（数 GB）
- ❌ 性能要求高（需要高性能 GPU）
- ❌ 开发成本高
- ❌ 模型效果可能不如云端 API

#### 结论
未来考虑，当前不推荐。

---

## 三、推荐方案详细设计

### 3.1 最终选择
**方案一：Electron + 本地 Node 后端**

### 3.2 技术栈选型

#### 后端技术栈
- **框架**: Express.js 4.x（轻量、成熟、易用）
- **语言**: TypeScript（保持类型安全）
- **HTTP 客户端**: node-fetch（调用 DeepSeek API）
- **环境变量**: dotenv（管理配置）
- **打包工具**: esbuild（快速打包后端代码）

#### 为什么选择 Express？
- ✅ 轻量级（核心仅 ~200KB）
- ✅ 生态成熟，中间件丰富
- ✅ 团队熟悉度高
- ✅ 文档完善

---

### 3.3 目录结构设计

```
dreambook/
├── src/                           # 前端代码
│   ├── pages/
│   ├── components/
│   ├── services/
│   │   └── aiService.ts          # 🆕 AI 服务封装
│   └── ...
│
├── backend/                       # 🆕 后端代码目录
│   ├── src/
│   │   ├── index.ts              # 后端入口
│   │   ├── config.ts             # 配置管理
│   │   ├── routes/
│   │   │   └── chat.ts           # 聊天路由
│   │   ├── services/
│   │   │   └── deepseek.ts       # DeepSeek API 封装
│   │   ├── prompts/
│   │   │   └── system.ts         # System Prompt 常量
│   │   └── types/
│   │       └── index.ts          # 类型定义
│   ├── package.json              # 后端依赖
│   ├── tsconfig.json             # 后端 TS 配置
│   ├── .env.example              # 环境变量模板
│   └── dist/                     # 打包输出（gitignore）
│
├── electron/
│   ├── main.ts                   # 修改：启动后端服务
│   └── preload.ts
│
├── scripts/
│   └── build-backend.ts          # 🆕 后端打包脚本
│
└── package.json                   # 根目录 package.json
```

---

### 3.4 核心模块设计

#### 3.4.1 后端服务入口 (`backend/src/index.ts`)

**职责**：
- 创建 Express 应用
- 注册中间件
- 注册路由
- 启动 HTTP 服务器

**代码结构**：
```typescript
import express from 'express'
import cors from 'cors'
import { config } from './config'
import chatRouter from './routes/chat'

const app = express()

// 中间件
app.use(cors(config.cors))
app.use(express.json())

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// 路由
app.use('/api', chatRouter)

// 错误处理
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// 启动服务
app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`)
})
```

---

#### 3.4.2 配置管理 (`backend/src/config.ts`)

**职责**：
- 管理环境变量
- 提供配置常量
- 验证必需配置

**配置项**：
```typescript
export const config = {
  // 服务配置
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',

  // DeepSeek 配置
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
      'http://localhost:5173',  // 开发环境
      'file://*',               // Electron 环境
    ],
    credentials: true,
  },
}

// 验证必需配置
if (!config.deepseek.apiKey) {
  console.warn('⚠️  DEEPSEEK_API_KEY not set!')
}
```

---

#### 3.4.3 聊天路由 (`backend/src/routes/chat.ts`)

**职责**：
- 处理聊天请求
- 参数验证
- 调用 DeepSeek 服务
- 错误处理

**接口设计**：
```typescript
POST /api/dream-chat

Request Body:
{
  "question": "我梦见自己在飞",
  "userId": "optional-user-id"
}

Response (成功):
{
  "answer": "梦见飞翔通常反映了..."
}

Response (失败):
{
  "error": "错误信息"
}
```

**路由实现**：
```typescript
import { Router } from 'express'
import { callDeepSeek } from '../services/deepseek'

const router = Router()

router.post('/dream-chat', async (req, res) => {
  const { question, userId } = req.body

  // 参数验证
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: '问题不能为空' })
  }

  if (question.length > 500) {
    return res.status(400).json({ error: '问题长度不能超过 500 字' })
  }

  try {
    const answer = await callDeepSeek(question, userId)
    res.json({ answer })
  } catch (error) {
    console.error('DeepSeek API error:', error)
    res.status(500).json({
      error: 'AI 服务暂时不可用，请稍后重试'
    })
  }
})

export default router
```

---

#### 3.4.4 DeepSeek 服务 (`backend/src/services/deepseek.ts`)

**职责**：
- 封装 DeepSeek API 调用
- 构建请求参数
- 处理响应和错误

**实现要点**：
```typescript
import fetch from 'node-fetch'
import { config } from '../config'
import { DREAM_SYSTEM_PROMPT } from '../prompts/system'

export async function callDeepSeek(
  question: string,
  userId?: string
): Promise<string> {
  const response = await fetch(
    `${config.deepseek.apiUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.deepseek.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.deepseek.model,
        messages: [
          {
            role: 'system',
            content: DREAM_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: config.deepseek.temperature,
        max_tokens: config.deepseek.maxTokens,
        user: userId,
      }),
      signal: AbortSignal.timeout(config.deepseek.timeout),
    }
  )

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`)
  }

  const data = await response.json()
  const answer = data.choices?.[0]?.message?.content

  if (!answer) {
    throw new Error('Invalid response from DeepSeek')
  }

  return answer
}
```

---

#### 3.4.5 System Prompt (`backend/src/prompts/system.ts`)

**职责**：
- 定义 AI 角色和行为规则
- 确保回答风格统一
- 避免医疗诊断和算命

**完整 Prompt**：
```typescript
export const DREAM_SYSTEM_PROMPT = `你是一名温和、理性、以心理学和日常生活经验为参考的「梦境解析助手」。

你的目标是：
- 帮助用户从「情绪、压力、关系、生活状态」的角度，理解自己的梦，而不是算命。
- 用通俗、温柔、不过度玄学的方式跟用户聊天，避免吓唬用户。
- 尽量给用户一些可落地的小建议，比如如何调整作息、如何表达情绪、如何自我照顾。

必须遵守的规则：
1. 不要做医疗诊断，不要判断用户是否有具体疾病。
2. 不要说「一定会发生」「必然」「注定」，不要预测具体的未来事件。
3. 不要给投资、法律等专业建议。
4. 可以适度提到传统文化里对梦的看法，但要明确说明「只是民间说法，不必当真」。
5. 遇到涉及自残、自杀、极端负面情绪时，要温柔安抚，并鼓励用户尽快寻求专业心理咨询或当地的紧急援助热线。

回答风格：
- 用第二人称「你」跟用户说话。
- 先用 1～2 句话概括这个梦可能反映的情绪或处境。
- 然后分点说明几种「可能的含义」，强调是「可能」而不是唯一真相。
- 最后给 2～4 条简单、可实行的生活或情绪建议。
- 结尾加一句类似「以上解读仅供参考，不代表现实会发生什么，也不能替代专业医疗或心理帮助」的提醒。

如果用户问的内容与你无法关联到梦境（比如纯理论、纯闲聊），就像普通聊天机器人一样正常回答即可。`
```

---

#### 3.4.6 前端服务封装 (`src/services/aiService.ts`)

**职责**：
- 封装后端 API 调用
- 处理加载状态和错误
- 提供统一的服务接口

**实现**：
```typescript
class AIService {
  private baseURL: string

  constructor() {
    // 开发环境和生产环境都用 localhost
    this.baseURL = 'http://localhost:3000'
  }

  /**
   * 询问梦境解析
   */
  async askDream(question: string): Promise<string> {
    if (!question || question.trim().length === 0) {
      throw new Error('问题不能为空')
    }

    const response = await fetch(`${this.baseURL}/api/dream-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!response.ok) {
      if (response.status === 400) {
        const data = await response.json()
        throw new Error(data.error || '请求参数错误')
      }
      throw new Error('AI 服务暂时不可用，请稍后重试')
    }

    const data = await response.json()
    return data.answer
  }

  /**
   * 检查后端服务是否可用
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const aiService = new AIService()
```

---

### 3.5 Electron 集成方案

#### 3.5.1 主进程启动后端 (`electron/main.ts`)

**实现思路**：
- 在 `app.on('ready')` 时启动后端服务
- 使用 `child_process.spawn` 启动 Node 进程
- 监控后端进程状态
- 应用退出时关闭后端

**代码结构**：
```typescript
import { app, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'

let backendProcess: ChildProcess | null = null

/**
 * 启动后端服务
 */
function startBackend() {
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    // 开发环境：假设手动启动后端
    console.log('Development mode: backend should be started manually')
    return
  }

  // 生产环境：启动打包后的后端
  const backendPath = join(process.resourcesPath, 'backend', 'index.js')

  backendProcess = spawn('node', [backendPath], {
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: '3000',
      DEEPSEEK_API_KEY: getAPIKey(), // 从配置读取
    }
  })

  backendProcess.stdout?.on('data', (data) => {
    console.log(`[Backend] ${data}`)
  })

  backendProcess.stderr?.on('data', (data) => {
    console.error(`[Backend Error] ${data}`)
  })

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`)
  })
}

/**
 * 关闭后端服务
 */
function stopBackend() {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
}

app.on('ready', () => {
  startBackend()

  // 等待后端启动后再创建窗口
  setTimeout(() => {
    createWindow()
  }, 2000)
})

app.on('window-all-closed', () => {
  stopBackend()
  app.quit()
})
```

---

#### 3.5.2 API Key 配置方案

**方案 A: 配置文件（推荐）**
```typescript
// 配置存储在 Electron userData 目录
const configPath = join(app.getPath('userData'), 'config.json')

function getAPIKey(): string {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return config.deepseekApiKey || ''
  } catch {
    return ''
  }
}

function setAPIKey(apiKey: string): void {
  const config = { deepseekApiKey: apiKey }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}
```

**方案 B: 环境变量（简单）**
```typescript
// 直接在代码中硬编码（仅适合单机部署）
const API_KEY = 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'
```

**推荐**: 单机场景使用方案 B，方便快捷。

---

### 3.6 打包和部署

#### 3.6.1 后端打包脚本 (`scripts/build-backend.ts`)

**职责**：
- 使用 esbuild 打包后端代码
- 输出到 Electron 资源目录

```typescript
import { build } from 'esbuild'
import { join } from 'path'

const outfile = join(__dirname, '../dist-electron/backend/index.js')

await build({
  entryPoints: ['backend/src/index.ts'],
  outfile,
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  external: [],
  minify: true,
})

console.log('✅ Backend bundled:', outfile)
```

---

#### 3.6.2 修改 package.json 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "dev:backend": "cd backend && tsx src/index.ts",
    "build": "tsc -b && vite build && npm run build:backend && npm run build:electron",
    "build:backend": "tsx scripts/build-backend.ts",
    "build:electron": "tsx scripts/build-electron.ts",
    "electron:build:win": "npm run build && electron-builder --win"
  }
}
```

---

#### 3.6.3 Electron Builder 配置

```json
{
  "build": {
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "dist-electron/backend",
        "to": "backend"
      }
    ]
  }
}
```

---

## 四、API 接口规范

### 4.1 健康检查接口

```
GET /health

Response:
{
  "status": "ok",
  "timestamp": 1702345678900
}
```

### 4.2 梦境解析接口

```
POST /api/dream-chat

Headers:
  Content-Type: application/json

Request Body:
{
  "question": "我梦见自己在天上飞",
  "userId": "user-123"  // 可选
}

Response (成功 200):
{
  "answer": "梦见飞翔通常反映了你对自由的渴望..."
}

Response (参数错误 400):
{
  "error": "问题不能为空"
}

Response (服务错误 500):
{
  "error": "AI 服务暂时不可用，请稍后重试"
}
```

---

## 五、实施步骤

### 5.1 阶段一：搭建后端服务（预计 4 小时）

**任务清单**：
- [ ] 创建 `backend/` 目录结构
- [ ] 安装后端依赖（Express、dotenv、node-fetch 等）
- [ ] 实现 `config.ts` 配置管理
- [ ] 实现 `prompts/system.ts` System Prompt
- [ ] 实现 `services/deepseek.ts` API 调用
- [ ] 实现 `routes/chat.ts` 路由处理
- [ ] 实现 `index.ts` 服务入口
- [ ] 本地测试接口（使用 Postman 或 curl）

**验收标准**：
- 后端服务可独立启动（`npm run dev:backend`）
- 健康检查接口返回正常
- 梦境解析接口返回正确答案
- 错误处理正常工作

---

### 5.2 阶段二：前端集成（预计 3 小时）

**任务清单**：
- [ ] 创建 `src/services/aiService.ts`
- [ ] 创建 AI 对话 UI 组件
  - 输入框组件
  - 回答展示区域
  - 加载状态
  - 错误提示
- [ ] 集成到现有页面（建议放在 DetailPage 或独立页面）
- [ ] 添加路由（如 `/ai-chat`）
- [ ] 前端调用测试

**UI 设计建议**：
```
┌─────────────────────────────────┐
│  🔮 梦境解析助手                │
├─────────────────────────────────┤
│                                 │
│  [输入框: 描述你的梦境...]      │
│                                 │
│  [提交按钮]                     │
│                                 │
├─────────────────────────────────┤
│  📝 解析结果：                  │
│                                 │
│  你梦见飞翔，这可能反映了...    │
│                                 │
└─────────────────────────────────┘
```

**验收标准**：
- 用户可以输入问题并提交
- 显示加载状态
- 正确展示 AI 回答
- 错误情况有友好提示

---

### 5.3 阶段三：Electron 集成（预计 3 小时）

**任务清单**：
- [ ] 修改 `electron/main.ts` 添加后端启动逻辑
- [ ] 实现 API Key 配置读取
- [ ] 创建 `scripts/build-backend.ts` 打包脚本
- [ ] 修改 `package.json` 构建脚本
- [ ] 修改 Electron Builder 配置
- [ ] 本地打包测试

**验收标准**：
- 开发环境可正常运行（手动启动后端）
- 生产环境 Electron 自动启动后端
- 打包后的应用可独立运行
- 后端日志正常输出

---

### 5.4 阶段四：测试和优化（预计 2 小时）

**任务清单**：
- [ ] 完整流程测试
- [ ] 异常情况测试
  - 网络断开
  - 后端启动失败
  - API Key 错误
  - 超时处理
- [ ] 性能优化
  - 响应时间测试
  - 内存占用检查
- [ ] UI 优化和动画
- [ ] 用户体验细节打磨

**验收标准**：
- 所有核心功能正常
- 异常情况有友好提示
- 响应时间 < 5 秒
- 无内存泄漏

---

### 5.5 阶段五：部署上线（预计 1 小时）

**任务清单**：
- [ ] 打包生产版本
  ```bash
  npm run electron:build:win
  ```
- [ ] 配置 API Key
- [ ] 复制到触摸屏机器
- [ ] 现场测试
- [ ] 用户培训

**部署步骤**：
1. 在开发机打包：`npm run electron:build:win`
2. 获取 `release/` 目录下的文件
3. 复制到触摸屏机器
4. 配置 API Key（如果使用配置文件方案）
5. 双击运行测试
6. 验证所有功能正常

---

## 六、技术细节

### 6.1 依赖包清单

#### 后端依赖
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

#### 前端新增依赖
无需额外依赖，使用原生 `fetch`。

---

### 6.2 环境变量配置

#### `.env.example` 示例
```bash
# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com

# 服务配置
PORT=3000
NODE_ENV=development
```

---

### 6.3 TypeScript 类型定义

```typescript
// backend/src/types/index.ts

export interface ChatRequest {
  question: string
  userId?: string
}

export interface ChatResponse {
  answer: string
}

export interface ErrorResponse {
  error: string
}

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature: number
  max_tokens: number
  user?: string
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}
```

---

### 6.4 错误处理策略

#### 后端错误分类
1. **参数错误 (400)**: 问题为空、过长等
2. **API 错误 (500)**: DeepSeek API 调用失败
3. **网络错误 (500)**: 超时、连接失败
4. **系统错误 (500)**: 未预期的异常

#### 前端错误处理
```typescript
try {
  const answer = await aiService.askDream(question)
  // 显示回答
} catch (error) {
  if (error.message === '问题不能为空') {
    // 显示表单验证错误
  } else if (error.message.includes('服务暂时不可用')) {
    // 显示"服务不可用"提示，建议稍后重试
  } else {
    // 显示通用错误提示
  }
}
```

---

### 6.5 性能优化

#### 后端优化
- 使用连接池（node-fetch 自动管理）
- 设置合理的超时时间（15 秒）
- 添加请求日志（可选）

#### 前端优化
- 防抖输入（避免频繁请求）
- 缓存历史回答（可选）
- 使用加载状态提升用户体验

---

### 6.6 安全考虑

1. **API Key 保护**
   - 不要提交到 Git 仓库
   - 使用 `.env` 文件（添加到 `.gitignore`）
   - 生产环境使用环境变量或配置文件

2. **CORS 配置**
   - 仅允许本地源访问
   - 生产环境限制为 `file://*`

3. **输入验证**
   - 限制问题长度（最大 500 字）
   - 过滤特殊字符（可选）

4. **速率限制**（可选）
   - 限制每用户每小时请求次数
   - 防止滥用

---

## 七、未来扩展方向

### 7.1 短期优化（1-2 周）

1. **流式输出**
   - 使用 SSE（Server-Sent Events）
   - 实现打字机效果
   - 提升用户体验

2. **历史记录**
   - 本地存储对话历史
   - 用户可查看历史解析
   - 数据存储在 Electron userData

3. **UI 优化**
   - 添加更多动画效果
   - 优化移动端/触摸屏体验
   - 添加语音输入（可选）

---

### 7.2 中期扩展（1-2 月）

1. **RAG 知识库**
   - 将梦境资料库向量化
   - 使用向量数据库（如 ChromaDB）
   - 检索相关知识后增强回答

2. **多模型支持**
   - 支持切换不同 AI 模型
   - 对比不同模型的回答
   - 成本和效果的平衡

3. **数据统计**
   - 用户使用统计
   - 高频梦境关键词分析
   - 数据可视化

---

### 7.3 长期规划（3+ 月）

1. **多语言支持**
   - 英文、日文等
   - 国际化（i18n）

2. **离线模式**
   - 内嵌本地 LLM
   - 完全离线运行
   - 适合无网络环境

3. **多端同步**
   - 云端存储对话记录
   - 跨设备同步

---

## 八、风险评估与应对

### 8.1 技术风险

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| DeepSeek API 不稳定 | 低 | 高 | 添加重试机制、降级方案 |
| 打包失败 | 中 | 中 | 充分测试打包流程 |
| 网络连接失败 | 低 | 高 | 友好提示、检测网络状态 |
| 后端启动失败 | 低 | 高 | 添加启动检测、错误日志 |

---

### 8.2 成本风险

**DeepSeek API 成本估算**：
- 单次对话约 1000 tokens（包含 system prompt + 用户问题 + AI 回答）
- DeepSeek 价格：约 ¥0.001/1000 tokens
- 假设每天 100 次对话：月成本约 ¥3
- **结论**: 成本极低，可忽略

---

### 8.3 用户体验风险

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| 响应时间过长 | 中 | 中 | 添加加载动画、优化提示词 |
| 回答质量不佳 | 低 | 高 | 优化 System Prompt、测试验证 |
| 操作不直观 | 中 | 中 | UI 迭代、用户测试 |

---

## 九、总结

### 9.1 方案优势

1. **简单实用**: 不过度设计，MVP 方案快速上线
2. **成本低廉**: 无需服务器，API 成本几乎为零
3. **易于维护**: 单机部署，无需运维
4. **易于扩展**: 架构清晰，后续可加 RAG、缓存等
5. **用户体验好**: 本地后端，响应快速

### 9.2 关键成功因素

- ✅ 网络环境稳定（已确认）
- ✅ DeepSeek API 稳定可用
- ✅ System Prompt 质量高
- ✅ 前后端分离架构合理
- ✅ Electron 集成测试充分

### 9.3 下一步行动

**立即开始实施**：
1. 创建后端目录结构
2. 实现核心功能
3. 前端集成测试
4. Electron 打包部署

**预计总工时**: 12-15 小时
**预计完成时间**: 2-3 个工作日

---

## 十、参考资料

### 10.1 官方文档
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Express.js 文档](https://expressjs.com/)
- [Electron 文档](https://www.electronjs.org/docs)
- [Electron Builder 文档](https://www.electron.build/)

### 10.2 相关技术
- [Node.js 文档](https://nodejs.org/docs)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [esbuild 文档](https://esbuild.github.io/)

---

**文档结束**

如有疑问或需要调整，请随时讨论。
