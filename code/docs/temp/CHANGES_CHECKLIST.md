# 后端独立部署 - 核心改动清单

## 📋 需要修改的文件

### 1️⃣ 后端配置修改

#### `backend/src/config.ts` - 支持环境变量配置
```diff
+ // 从环境变量读取允许的源
+ const allowedOrigins = process.env.ALLOWED_ORIGINS
+   ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
+   : ['http://localhost:5173', 'http://localhost:5174', 'file://*']

- cors: {
-   origin: [
-     'http://localhost:5173',
-     'http://localhost:5174',
-     'file://*',
-   ],
-   credentials: true,
- }

+ cors: {
+   origin: allowedOrigins,
+   credentials: true,
+   methods: ['GET', 'POST', 'OPTIONS'],
+   allowedHeaders: ['Content-Type', 'Authorization'],
+ }
```

### 2️⃣ 新增日志中间件

#### `backend/src/middleware/logging.ts` - 请求日志记录
```typescript
import { promises as fs } from 'fs'
import path from 'path'

const logsDir = './logs'

async function ensureLogsDir() {
  try {
    await fs.mkdir(logsDir, { recursive: true })
  } catch (err) {
    console.error('[Logging] Failed to create logs directory:', err)
  }
}

export async function logChatRequest(data: {
  timestamp: string
  userId?: string
  question: string
  status: 'success' | 'error'
  duration: number
  error?: string
}) {
  await ensureLogsDir()
  const today = new Date().toISOString().split('T')[0]
  const logFile = path.join(logsDir, `${today}.jsonl`)
  const logLine = JSON.stringify(data) + '\n'

  try {
    await fs.appendFile(logFile, logLine)
  } catch (err) {
    console.error('[Logging] Failed to write log:', err)
  }
}
```

### 3️⃣ 路由改进

#### `backend/src/routes/chat.ts` - 添加日志和错误处理
```diff
+ import { logChatRequest } from '../middleware/logging'

router.post('/dream-chat', async (req, res) => {
+ const startTime = Date.now()
  const { question, userId } = req.body as ChatRequest

  // 参数验证
  if (!question || question.trim().length === 0) {
+   await logChatRequest({
+     timestamp: new Date().toISOString(),
+     userId,
+     question: '',
+     status: 'error',
+     duration: Date.now() - startTime,
+     error: '问题不能为空',
+   })
    return res.status(400).json({ error: '问题不能为空' })
  }

  try {
    const answer = await callDeepSeek(question, userId)
+   const duration = Date.now() - startTime

+   await logChatRequest({
+     timestamp: new Date().toISOString(),
+     userId,
+     question: question.substring(0, 100),
+     status: 'success',
+     duration,
+   })

    res.json({ answer } satisfies ChatResponse)
  } catch (error) {
+   const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'AI 服务暂时不可用'

+   await logChatRequest({
+     timestamp: new Date().toISOString(),
+     userId,
+     question: question.substring(0, 100),
+     status: 'error',
+     duration,
+     error: errorMessage,
+   })

    res.status(500).json({ error: errorMessage })
  }
})
```

---

## 🐳 需要创建的新文件

### 1️⃣ Docker 相关

#### `backend/Dockerfile`
```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 复制源代码并构建
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

#### `Dockerfile.frontend`
```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# 从构建参数获取 API URL
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN yarn build

# 运行阶段 - Nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 配置 Nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 80;

  # SPA 路由配置
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  # API 代理
  location /api {
    proxy_pass http://backend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: dreambook-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-http://localhost}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        VITE_API_URL: ${VITE_API_URL:-http://backend:3000}
    container_name: dreambook-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 2️⃣ 环境配置

#### `.env.example`
```bash
# 后端配置
DEEPSEEK_API_KEY=sk-your-api-key-here
NODE_ENV=production
PORT=3000

# 跨域配置 (多个源用逗号分隔)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 前端 API 地址
VITE_API_URL=https://api.yourdomain.com
```

### 3️⃣ 前端 API 客户端

#### `src/utils/apiClient.ts`
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface DreamChatRequest {
  question: string
  userId?: string
}

export interface DreamChatResponse {
  answer: string
}

export async function dreamChat(
  question: string,
  userId?: string
): Promise<DreamChatResponse> {
  const response = await fetch(`${API_URL}/api/dream-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, userId } as DreamChatRequest),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '服务异常，请稍后重试')
  }

  return response.json() as Promise<DreamChatResponse>
}
```

---

## 🚀 部署执行命令

### 本地测试
```bash
# 1. 设置环境变量
export DEEPSEEK_API_KEY="sk-xxxxxxxxxxxxx"
export ALLOWED_ORIGINS="http://localhost,http://localhost:80"

# 2. 构建并启动
docker-compose up --build

# 3. 验证
curl http://localhost:3000/health
```

### 生产部署
```bash
# 1. 登录服务器
ssh user@server.com

# 2. 克隆项目
cd /opt
git clone https://github.com/yourname/dreambook.git
cd dreambook

# 3. 配置环境
cat > .env.production << 'EOF'
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxx
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
EOF

# 4. 启动服务
docker-compose up -d

# 5. 检查日志
docker-compose logs -f backend
```

---

## 📊 改动影响分析

| 模块 | 改动 | 影响范围 | 优先级 |
|------|------|--------|--------|
| CORS | 支持环境变量 | 后端配置 | P0 |
| 日志 | 新增中间件 | 请求追踪 | P0 |
| Docker | 新增镜像配置 | 部署方式 | P0 |
| 环境变量 | 新增配置文件 | 部署管理 | P0 |
| API 客户端 | 新增工具函数 | 前端调用 | P1 |

---

## ✅ 验证清单

部署后需要验证:

- [ ] 后端服务正常运行 (`curl http://localhost:3000/health`)
- [ ] CORS 配置正确 (允许前端域名)
- [ ] 日志文件正确生成 (`ls -la logs/`)
- [ ] API 调用成功 (`curl -X POST http://localhost:3000/api/dream-chat`)
- [ ] 前端页面加载 (访问 `http://localhost`)
- [ ] 端到端功能测试 (输入梦境内容 → 获取解读)

---

## 🔗 相关文档

- 详细部署方案: `DEPLOYMENT_PLAN.md`
- 快速启动指南: `QUICK_START.md`
- API 文档: `backend/README.md` (需创建)

