# 梦书应用服务器部署方案

## 一、当前架构分析

### 现状
- **前端**: React + Vite (目前打包成 Electron 桌面应用)
- **后端**: Express.js (目前嵌入在 Electron 中)
- **部署模式**: 单机应用，后端与 Electron 应用打包在一起
- **API 通信**: 本地 localhost:3000

### 存在的问题
1. **CORS 配置**: 目前只配置了本地地址，不支持跨域服务器访问
2. **用户数据管理**: 无持久化存储，每次重启数据丢失
3. **部署方式**: 后端被绑定在 Electron 中，难以独立扩展
4. **API 安全**: 缺少认证、速率限制、日志审计等
5. **请求跟踪**: `userId` 传输但未记录到数据库

---

## 二、服务器部署需求分析

### 部署场景
用户通过**扫二维码** → **访问 Web 界面** → **输入梦境内容** → **获取 AI 解读**

### 部署架构
```
┌─────────────────────────────────────────┐
│        用户设备 (触摸屏/手机)           │
│  扫码 → Web 浏览器 → https://server.com │
└──────────────┬──────────────────────────┘
               │
               ▼
     ┌─────────────────┐
     │   Web 服务器    │
     │  (前端静态资源)  │
     │   (Nginx/Node)  │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │   后端 API 服务  │
     │   (Express.js)  │
     │   localhost:3000 │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │  数据库服务     │
     │  (SQLite/MySQL) │
     └─────────────────┘
              │
              ▼
     ┌─────────────────┐
     │ DeepSeek API    │
     │ (第三方服务)    │
     └─────────────────┘
```

---

## 三、具体实施步骤

### 第1阶段：后端独立化 (当前优先)

#### 1.1 更新 CORS 配置
**文件**: `backend/src/config.ts`

```typescript
// 支持从环境变量配置允许的源
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'file://*', // Electron
    ]

cors: {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
```

#### 1.2 添加请求日志和速率限制
**新文件**: `backend/src/middleware/rateLimit.ts`

```typescript
import express from 'express'

const requestCounts = new Map<string, number[]>()
const LIMIT = 5 // 每个 IP 每分钟最多 5 个请求
const WINDOW = 60 * 1000 // 1 分钟

export function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || 'unknown'
  const now = Date.now()

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, [])
  }

  const counts = requestCounts.get(ip)!
  const recentRequests = counts.filter(time => now - time < WINDOW)

  if (recentRequests.length >= LIMIT) {
    return res.status(429).json({
      error: '请求过于频繁，请稍后再试'
    })
  }

  recentRequests.push(now)
  requestCounts.set(ip, recentRequests)
  next()
}
```

#### 1.3 添加用户请求日志持久化
**新文件**: `backend/src/middleware/logging.ts`

```typescript
import { promises as fs } from 'fs'
import path from 'path'

const logsDir = './logs'
const today = new Date().toISOString().split('T')[0]

// 确保日志目录存在
async function ensureLogsDir() {
  try {
    await fs.mkdir(logsDir, { recursive: true })
  } catch (err) {
    console.error('Failed to create logs directory:', err)
  }
}

export async function logRequest(data: {
  timestamp: string
  userId?: string
  question: string
  response: string
  tokens?: number
  duration: number
  status: 'success' | 'error'
  error?: string
}) {
  await ensureLogsDir()

  const logFile = path.join(logsDir, `${today}.jsonl`)
  const logLine = JSON.stringify(data) + '\n'

  try {
    await fs.appendFile(logFile, logLine)
  } catch (err) {
    console.error('Failed to write log:', err)
  }
}
```

#### 1.4 更新路由添加日志记录
**修改**: `backend/src/routes/chat.ts`

```typescript
router.post('/dream-chat', async (req, res) => {
  const startTime = Date.now()
  const { question, userId } = req.body as ChatRequest

  // ... 参数验证 ...

  try {
    const answer = await callDeepSeek(question, userId)
    const duration = Date.now() - startTime

    // 记录成功请求
    await logRequest({
      timestamp: new Date().toISOString(),
      userId,
      question: question.substring(0, 100),
      response: answer.substring(0, 100),
      duration,
      status: 'success',
      tokens: data.usage?.total_tokens,
    })

    res.json({ answer } satisfies ChatResponse)
  } catch (error) {
    const duration = Date.now() - startTime

    // 记录错误请求
    await logRequest({
      timestamp: new Date().toISOString(),
      userId,
      question: question.substring(0, 100),
      response: '',
      duration,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    res.status(500).json({ error: errorMessage } satisfies ErrorResponse)
  }
})
```

### 第2阶段：前端独立部署

#### 2.1 创建环境变量配置
**新文件**: `.env.production`

```
VITE_API_URL=https://api.yourserver.com
VITE_API_TIMEOUT=15000
```

**修改**: `vite.config.ts`

```typescript
export default defineConfig({
  define: {
    __API_URL__: JSON.stringify(
      import.meta.env.VITE_API_URL || 'http://localhost:3000'
    ),
  },
})
```

#### 2.2 创建 API 客户端
**新文件**: `src/utils/apiClient.ts`

```typescript
const API_URL = __API_URL__

export async function dreamChat(question: string, userId?: string) {
  const response = await fetch(`${API_URL}/api/dream-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, userId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '服务异常')
  }

  return response.json()
}
```

### 第3阶段：Docker 容器化

#### 3.1 后端 Dockerfile
**新文件**: `backend/Dockerfile`

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 安装生产依赖
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 创建日志目录
RUN mkdir -p /app/logs

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
```

#### 3.2 前端 Dockerfile
**新文件**: `Dockerfile.frontend`

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN VITE_API_URL=$VITE_API_URL yarn build

# Nginx 运行阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3.3 Docker Compose 配置
**新文件**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - ALLOWED_ORIGINS=https://yourserver.com,http://localhost:80
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        VITE_API_URL: https://api.yourserver.com
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 第4阶段：服务器部署

#### 4.1 Nginx 反向代理配置
**新文件**: `nginx.conf`

```nginx
upstream backend {
  server backend:3000;
}

server {
  listen 80;
  server_name yourserver.com;

  # HTTP 重定向到 HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourserver.com;

  ssl_certificate /etc/letsencrypt/live/yourserver.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourserver.com/privkey.pem;

  # 前端静态资源
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  # 后端 API
  location /api {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # 健康检查
  location /health {
    access_log off;
    proxy_pass http://backend/health;
  }
}
```

#### 4.2 环境变量文件
**新文件**: `.env.server`

```bash
# 后端配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxx
NODE_ENV=production
PORT=3000

# 跨域配置
ALLOWED_ORIGINS=https://yourserver.com,https://www.yourserver.com

# 日志配置
LOG_LEVEL=info
```

---

## 四、前端集成步骤

### 4.1 添加 AI 解读页面路由
**新文件**: `src/pages/AIChatPage/AIChatPage.tsx`

```typescript
import { useState, useRef } from 'react'
import { dreamChat } from '@utils/apiClient'
import styles from './AIChatPage.module.css'

export const AIChatPage: React.FC = () => {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!question.trim()) return

    setLoading(true)
    try {
      const result = await dreamChat(question)
      setResponse(result.answer)
    } catch (error) {
      setResponse(`错误: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.chatPage}>
      {/* UI 组件 */}
    </div>
  )
}
```

### 4.2 更新路由配置
**修改**: `src/App.tsx`

```typescript
// 添加新路由
<Route path="/ai-chat" element={<AIChatPage />} />
```

---

## 五、部署检查清单

### 部署前准备
- [ ] 配置环境变量 (DEEPSEEK_API_KEY, ALLOWED_ORIGINS)
- [ ] 获取 SSL 证书 (Let's Encrypt)
- [ ] 测试 API 端点连接
- [ ] 测试跨域请求
- [ ] 准备日志存储空间
- [ ] 配置日志轮转

### 部署执行
- [ ] 构建 Docker 镜像
- [ ] 启动 docker-compose
- [ ] 验证后端 health 端点
- [ ] 验证前端页面加载
- [ ] 测试梦境输入功能
- [ ] 监控日志输出

### 监控和维护
- [ ] 设置日志告警
- [ ] 监控 API 响应时间
- [ ] 监控 DeepSeek API 配额
- [ ] 定期备份日志
- [ ] 定期更新依赖

---

## 六、安全建议

1. **API 认证**: 后期可添加 JWT 认证
2. **请求签名**: 防止 API 滥用
3. **IP 白名单**: 如果是内部使用
4. **数据加密**: 敏感数据加密存储
5. **审计日志**: 记录所有 API 调用
6. **备份策略**: 定期备份日志数据

---

## 七、成本考虑

| 项目 | 预估成本 |
|------|--------|
| 服务器 (小配置) | $5-10/月 |
| SSL 证书 | 免费 (Let's Encrypt) |
| DeepSeek API | 按使用量计费 |
| CDN (可选) | $0-5/月 |
| 备份存储 | $1-5/月 |
| **总计** | **$6-25/月** |

---

## 八、后续优化方向

1. **数据库集成**: 使用 SQLite/MySQL 存储用户问答记录
2. **用户管理**: 实现用户注册/登录系统
3. **分析看板**: 构建管理后台查看统计数据
4. **多语言支持**: 支持多语言梦境解读
5. **缓存优化**: 使用 Redis 缓存热门问题答案
6. **自动化部署**: 设置 CI/CD 流水线

