# 梦书应用部署 - 快速启动指南

## 优先级排序

### 🔴 P0 - 立即实施 (第1周)
1. **更新 CORS 配置** - 支持远程访问
2. **添加速率限制** - 防止 API 滥用
3. **添加请求日志** - 追踪用户行为
4. **Docker 化后端** - 容器化部署
5. **环境变量管理** - 安全配置

### 🟠 P1 - 本周实施 (第2-3周)
1. **Docker 化前端** - 前端容器化
2. **Docker Compose** - 本地一键启动
3. **Nginx 反向代理** - 生产环境配置
4. **SSL/HTTPS** - 启用 HTTPS
5. **日志轮转** - 防止日志爆炸

### 🟡 P2 - 可延后 (第4周+)
1. **数据库持久化** - SQLite/MySQL
2. **用户认证** - JWT/OAuth
3. **管理后台** - 数据查看面板
4. **CDN 部署** - 加速静态资源
5. **自动化 CI/CD** - GitHub Actions

---

## 快速启动流程 (2-3小时)

### 第1步：准备环境配置文件

**创建** `backend/.env.production`:
```bash
NODE_ENV=production
PORT=3000
DEEPSEEK_API_KEY=sk-your-api-key-here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**创建** `docker-compose.yml`:
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
      NODE_ENV: production
      PORT: 3000
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      args:
        VITE_API_URL: http://backend:3000
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 第2步：创建后端 Dockerfile

**创建** `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/logs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### 第3步：创建前端 Dockerfile

**创建** `Dockerfile.frontend`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
  location /api {
    proxy_pass http://backend:3000;
  }
}
EOF
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 第4步：更新 CORS 配置

**修改** `backend/src/config.ts`:
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'file://*']

export const config = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',

  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 600,
    timeout: 15000,
  },

  cors: {
    origin: allowedOrigins.map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
}
```

### 第5步：添加请求日志中间件

**创建** `backend/src/middleware/logging.ts`:
```typescript
import { promises as fs } from 'fs'
import path from 'path'
import type { Request, Response, NextFunction } from 'express'

const logsDir = './logs'

async function ensureLogsDir() {
  try {
    await fs.mkdir(logsDir, { recursive: true })
  } catch (err) {
    console.error('Failed to create logs directory:', err)
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
    console.error('Failed to write log:', err)
  }
}
```

**修改** `backend/src/routes/chat.ts`:
```typescript
import { logChatRequest } from '../middleware/logging'

router.post('/dream-chat', async (req, res) => {
  const startTime = Date.now()
  const { question, userId } = req.body as ChatRequest

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: '问题不能为空' })
  }

  console.log(`[Chat] Received from ${userId || 'anonymous'}: "${question.substring(0, 50)}..."`)

  try {
    const answer = await callDeepSeek(question, userId)
    const duration = Date.now() - startTime

    // 记录成功请求
    await logChatRequest({
      timestamp: new Date().toISOString(),
      userId,
      question: question.substring(0, 100),
      status: 'success',
      duration,
    })

    res.json({ answer } satisfies ChatResponse)
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'AI 服务暂时不可用'

    // 记录错误请求
    await logChatRequest({
      timestamp: new Date().toISOString(),
      userId,
      question: question.substring(0, 100),
      status: 'error',
      duration,
      error: errorMessage,
    })

    res.status(500).json({ error: errorMessage })
  }
})
```

### 第6步：启动服务

```bash
# 设置环境变量
export DEEPSEEK_API_KEY="sk-your-api-key"
export ALLOWED_ORIGINS="https://yourdomain.com"

# 启动 Docker Compose
docker-compose up --build

# 访问应用
# 前端: http://localhost
# 后端 API: http://localhost:3000/api/dream-chat
# 健康检查: http://localhost:3000/health
```

---

## 生产环境部署步骤

### 在云服务器上执行

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/dreambook.git
cd dreambook

# 2. 配置环境变量
nano .env.production
# 设置 DEEPSEEK_API_KEY 和 ALLOWED_ORIGINS

# 3. 构建镜像
docker-compose build

# 4. 启动服务
docker-compose up -d

# 5. 验证服务
curl http://localhost:3000/health
curl http://localhost/

# 6. 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 使用 Let's Encrypt 配置 HTTPS

```bash
# 安装 certbot
apt-get install certbot python3-certbot-nginx

# 获取证书
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# 配置 Nginx (修改 nginx.conf)
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# 重启 Docker
docker-compose down
docker-compose up -d
```

---

## 监控和调试

### 查看日志
```bash
# 后端日志
tail -f logs/$(date +%Y-%m-%d).jsonl

# 实时监控
docker-compose logs -f backend

# 查看特定日期的日志
jq . logs/2024-01-21.jsonl | less
```

### 健康检查
```bash
# 检查后端健康状态
curl http://yourdomain.com/health

# 测试 API
curl -X POST http://yourdomain.com/api/dream-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"我梦见了什么","userId":"test123"}'
```

### 常见问题

**问题 1**: CORS 错误
```
解决方案: 检查 ALLOWED_ORIGINS 环境变量是否包含前端域名
```

**问题 2**: 502 Bad Gateway
```
解决方案: 检查后端容器是否正常运行
docker-compose logs backend
```

**问题 3**: API 超时
```
解决方案: 检查 DeepSeek API Key 和网络连接
```

---

## 性能优化建议

### 1. 启用 Gzip 压缩
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

### 2. 设置缓存策略
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

### 3. 优化 Node.js
```bash
# 使用 PM2 进程管理 (可选)
npm install -g pm2
pm2 start dist/index.js --name backend
```

### 4. 监控资源使用
```bash
# 查看容器资源使用
docker stats
```

---

## 备份和恢复

```bash
# 备份日志
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/

# 定期备份脚本 (crontab)
0 2 * * * tar -czf /backup/logs-$(date +\%Y\%m\%d).tar.gz /app/logs/
```

---

## 后续需要实施

- [ ] 添加数据库存储 (SQLite/MySQL)
- [ ] 实现用户身份验证
- [ ] 构建管理后台
- [ ] 设置监控告警
- [ ] 配置自动备份
- [ ] 实施 CI/CD 流水线

