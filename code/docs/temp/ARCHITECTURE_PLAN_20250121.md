# DreamBook Web 版架构改造计划

**日期**: 2025-01-21
**目标**: 将 Electron 应用改造为网页版，部署到服务器
**架构**: Nginx (静态文件) + Express (API) + Docker

---

## 📊 整体架构

### 当前状态
- Electron 应用（本地运行）
- 后端嵌入在 Electron 中
- 只能在触摸屏上使用

### 目标状态
```
用户扫描二维码
  ↓
打开网页 (Nginx 托管)
  ↓
输入梦境 → 后端 API (Express)
  ↓
调用 DeepSeek API
  ↓
返回解析结果
```

### 架构图
```
┌──────────────────────────────────────┐
│         用户浏览器/手机             │
└────────────────┬─────────────────────┘
                 │
        ┌────────▼────────┐
        │   Nginx (80)    │
        │ 反向代理+静态   │
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼──────┐   ┌─────▼──────┐
   │ 静态文件  │   │  /api/*    │
   │ (React)   │   │ (转发)     │
   └───────────┘   │            │
                   └─────┬──────┘
                         │
                  ┌──────▼──────┐
                  │ Express API │
                  │  (3000)     │
                  └──────┬──────┘
                         │
                  ┌──────▼──────────┐
                  │ DeepSeek API    │
                  │ (梦境解析)      │
                  └─────────────────┘
```

---

## 📁 目录结构规划

```
/code/backend/
│
├── src/                           # Express 后端代码（保持不变）
│   ├── index.ts                  # 服务器入口
│   ├── config.ts                 # 配置文件
│   ├── routes/
│   │   └── chat.ts               # /api/dream-chat 路由
│   ├── services/
│   │   └── deepseek.ts           # DeepSeek API 调用
│   ├── prompts/
│   │   └── system.ts             # 系统提示词
│   └── types/
│       └── index.ts              # TypeScript 类型
│
├── web/                          # 🆕 网页前端（新建）
│   │
│   ├── src/
│   │   ├── main.tsx              # React 入口
│   │   ├── App.tsx               # 应用根组件（简化版，只有 AIChat）
│   │   ├── App.css               # 全局样式
│   │   │
│   │   ├── pages/
│   │   │   └── AIChat/           # 梦境解析页面
│   │   │       ├── index.tsx      # 页面组件
│   │   │       └── index.css      # 页面样式
│   │   │
│   │   ├── components/           # 可复用组件
│   │   │   ├── ParticleBackground/
│   │   │   │   ├── index.ts
│   │   │   │   ├── ParticleBackground.tsx
│   │   │   │   └── ParticleBackground.module.css
│   │   │   └── Toast/
│   │   │       ├── index.ts
│   │   │       ├── Toast.tsx
│   │   │       └── Toast.module.css
│   │   │
│   │   ├── services/
│   │   │   └── aiService.ts      # AI 服务（改为支持环境变量）
│   │   │
│   │   ├── hooks/                # React hooks（可选）
│   │   │   └── useVirtualKeyboard.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── assetPath.ts
│   │   │   └── TouchTexture.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── variables.css
│   │   │
│   │   ├── types/
│   │   │   └── dream.d.ts
│   │   │
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   │
│   ├── public/                  # 静态资源（复制）
│   │   ├── assets/
│   │   │   ├── backgrounds/
│   │   │   └── ...
│   │   ├── data/
│   │   │   └── dreamData.json
│   │   ├── dreams/
│   │   └── logo.png
│   │
│   ├── index.html              # HTML 入口
│   ├── package.json            # 前端依赖配置
│   ├── vite.config.ts          # Vite 构建配置
│   ├── tsconfig.json           # TypeScript 配置
│   ├── tsconfig.app.json       # 应用配置
│   ├── tsconfig.node.json      # Node 配置
│   └── eslint.config.js        # ESLint 配置
│
├── nginx/                       # 🆕 Nginx 配置（新建）
│   ├── nginx.conf              # Nginx 主配置文件
│   ├── Dockerfile              # Nginx Docker 镜像
│   └── ssl/                    # (可选) SSL 证书目录
│       ├── cert.pem
│       └── key.pem
│
├── dist-backend/               # 后端编译输出（自动生成）
│
├── Dockerfile                  # 🆕 后端 Docker 镜像
├── docker-compose.yml          # 🆕 本地开发 Docker Compose
├── docker-compose.prod.yml     # 🆕 生产环境 Docker Compose
│
├── package.json                # 后端 package.json（改）
├── package-lock.json
├── tsconfig.json               # 后端 TypeScript 配置
│
├── .env.example                # 🆕 环境变量示例
├── .dockerignore                # 🆕 Docker 忽略文件
├── .gitignore                  # 更新
│
└── README.md                   # 🆕 部署和使用说明
```

---

## 🔄 改动清单

### 新建文件（🆕）
| 文件路径 | 用途 |
|---------|------|
| `web/` | 整个前端目录 |
| `web/src/App.tsx` | 简化版应用根组件 |
| `web/vite.config.ts` | 前端构建配置 |
| `nginx/nginx.conf` | Nginx 反向代理配置 |
| `nginx/Dockerfile` | Nginx 容器镜像 |
| `Dockerfile` | Express 后端容器镜像 |
| `docker-compose.yml` | 本地开发容器编排 |
| `docker-compose.prod.yml` | 生产环境容器编排 |
| `.env.example` | 环境变量模板 |
| `.dockerignore` | Docker 构建忽略文件 |
| `README.md` | 部署文档 |

### 修改文件（✏️）
| 文件路径 | 修改内容 |
|---------|---------|
| `src/services/aiService.ts` | 改为支持环境变量配置 API 地址 |
| `src/index.ts` | 删除静态文件托管代码 |
| `package.json` | 删除 Electron 相关依赖和脚本 |

### 删除内容（🗑️）
| 内容 | 原因 |
|------|------|
| `electron/` 目录 | 不需要 Electron |
| Electron 相关脚本 | 不需要打包 .exe |
| Windows 脚本文件 | 不需要 Kiosk 配置 |
| `scripts/build-electron.ts` | 不需要 Electron 构建 |

### 复制文件（📋）
| 源 | 目标 | 内容 |
|-----|------|------|
| `src/pages/AIChat/` | `web/src/pages/AIChat/` | AIChat 页面 |
| `src/components/` | `web/src/components/` | 需要的组件 |
| `src/services/` | `web/src/services/` | 服务层代码 |
| `src/hooks/` | `web/src/hooks/` | React hooks |
| `src/utils/` | `web/src/utils/` | 工具函数 |
| `src/styles/` | `web/src/styles/` | 全局样式 |
| `src/types/` | `web/src/types/` | TypeScript 类型 |
| `public/` | `web/public/` | 所有静态资源 |

---

## 🔧 关键代码改动

### 1. web/src/App.tsx（新建）
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AIChat } from '@pages/AIChat'
import './App.css'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AIChat />} />
        {/* 所有其他路由也指向 AIChat */}
        <Route path="*" element={<AIChat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**改动点**:
- 使用 `BrowserRouter` 而不是 `HashRouter`
- 只有一个 AIChat 页面
- 删除了其他页面（HomePage、NavigationPage 等）

---

### 2. web/src/services/aiService.ts（改）
```typescript
class AIService {
  private baseURL: string

  constructor() {
    // 优先级：
    // 1. 环境变量 (VITE_API_URL)
    // 2. 当前域名 (window.location.origin)
    this.baseURL = import.meta.env.VITE_API_URL || window.location.origin
  }

  async askDream(question: string, userId?: string): Promise<string> {
    // ... 保持原来的逻辑，但 baseURL 现在是动态的
  }
}
```

**改动点**:
- 支持 `VITE_API_URL` 环境变量
- 默认使用当前域名 (`window.location.origin`)
- 开发时: `http://localhost:3000`
- 生产时: `https://api.example.com`

---

### 3. web/vite.config.ts（新建）
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',  // Web 版本使用绝对路径
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['gsap']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

**改动点**:
- `base: '/'` 用于网页版本
- 添加开发服务器代理，便于本地开发

---

### 4. nginx/nginx.conf（新建）
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log /var/log/nginx/access.log main;

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  gzip on;
  gzip_vary on;
  gzip_types text/plain text/css text/xml text/javascript
             application/x-javascript application/xml+rss
             application/json application/javascript;

  # 后端服务
  upstream backend {
    server backend:3000;
  }

  # HTTP 服务器
  server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # 静态文件 - React 前端
    location / {
      root /usr/share/nginx/html;

      # SPA 路由处理：所有非文件请求重定向到 index.html
      try_files $uri $uri/ /index.html;

      # 缓存设置
      expires 1h;
      add_header Cache-Control "public, max-age=3600";
    }

    # 缓存破坏的资源（带 hash）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      root /usr/share/nginx/html;
      expires 7d;
      add_header Cache-Control "public, max-age=604800, immutable";
    }

    # API 接口转发到后端
    location /api/ {
      proxy_pass http://backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_redirect off;
    }

    # 健康检查接口
    location /health {
      proxy_pass http://backend/health;
    }

    # 其他请求返回 404
    error_page 404 /index.html;
  }
}
```

**核心功能**:
- 托管 React 静态文件（dist）
- SPA 路由处理（所有路由指向 index.html）
- 反向代理 /api 请求到后端
- 缓存优化
- GZIP 压缩

---

### 5. Dockerfile（后端，新建）
```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY backend/package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY backend/src ./src
COPY backend/tsconfig.json ./

# 编译 TypeScript
RUN npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 安装生产依赖
COPY backend/package*.json ./
RUN npm ci --only=production

# 复制编译后的代码
COPY --from=builder /app/dist ./dist

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["node", "dist/index.js"]
```

---

### 6. nginx/Dockerfile（Nginx，新建）
```dockerfile
FROM nginx:alpine

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义配置
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# 创建前端目录
RUN mkdir -p /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

### 7. docker-compose.yml（本地开发，新建）
```yaml
version: '3.8'

services:
  # Nginx 反向代理 + 静态文件托管
  nginx:
    build:
      context: .
      dockerfile: nginx/Dockerfile
    container_name: dreambook-nginx
    ports:
      - "80:80"
    volumes:
      # 挂载前端构建输出
      - ./web/dist:/usr/share/nginx/html:ro
      # 挂载配置文件（便于调试修改）
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    networks:
      - dreambook-network
    restart: unless-stopped

  # Express 后端 API 服务
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dreambook-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - CORS_ORIGIN=http://localhost
    networks:
      - dreambook-network
    restart: unless-stopped
    volumes:
      # 开发时挂载源代码便于调试
      - ./src:/app/src:ro

networks:
  dreambook-network:
    driver: bridge
```

**使用方法**:
```bash
# 开发启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

### 8. docker-compose.prod.yml（生产环境，新建）
```yaml
version: '3.8'

services:
  nginx:
    build:
      context: .
      dockerfile: nginx/Dockerfile
    container_name: dreambook-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./web/dist:/usr/share/nginx/html:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      # SSL 证书（可选）
      # - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    networks:
      - dreambook-network
    restart: always

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dreambook-backend-prod
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - CORS_ORIGIN=https://your-domain.com
    networks:
      - dreambook-network
    restart: always

networks:
  dreambook-network:
    driver: bridge
```

---

## 📝 环境变量配置

### .env.example（新建）
```env
# 后端配置
NODE_ENV=development
PORT=3000
DEEPSEEK_API_KEY=sk_your_api_key_here

# 前端配置
VITE_API_URL=http://localhost:3000

# CORS 配置
CORS_ORIGIN=http://localhost
```

---

## 🚀 执行步骤

### 第 1 阶段：准备工作
- [ ] 1.1 创建目录结构 (`web/`, `nginx/`)
- [ ] 1.2 复制前端文件到 `web/` 目录
- [ ] 1.3 复制公共资源到 `web/public/`

### 第 2 阶段：前端改造
- [ ] 2.1 创建简化版 `web/src/App.tsx`
- [ ] 2.2 修改 `web/src/services/aiService.ts`（支持环境变量）
- [ ] 2.3 创建 `web/vite.config.ts`
- [ ] 2.4 创建 `web/package.json`
- [ ] 2.5 创建 `web/index.html`

### 第 3 阶段：后端改造
- [ ] 3.1 修改 `backend/src/index.ts`（删除静态文件托管）
- [ ] 3.2 修改 `backend/package.json`（删除 Electron 依赖）
- [ ] 3.3 创建 `Dockerfile`

### 第 4 阶段：基础设施
- [ ] 4.1 创建 `nginx/nginx.conf`
- [ ] 4.2 创建 `nginx/Dockerfile`
- [ ] 4.3 创建 `docker-compose.yml`
- [ ] 4.4 创建 `docker-compose.prod.yml`
- [ ] 4.5 创建 `.env.example` 和 `.dockerignore`

### 第 5 阶段：测试部署
- [ ] 5.1 本地构建前端 (`cd web && npm run build`)
- [ ] 5.2 本地启动 Docker Compose (`docker-compose up -d`)
- [ ] 5.3 测试网页访问 (`http://localhost`)
- [ ] 5.4 测试 API 调用 (提交梦境)
- [ ] 5.5 测试 AI 解析功能

### 第 6 阶段：文档和清理
- [ ] 6.1 创建 `README.md`（部署指南）
- [ ] 6.2 删除 Electron 相关文件
- [ ] 6.3 更新 `.gitignore`

---

## 📋 文件清单总结

### 新建文件数: 11
- web/ 目录结构（复制改造）
- nginx/nginx.conf
- nginx/Dockerfile
- Dockerfile
- docker-compose.yml
- docker-compose.prod.yml
- .env.example
- .dockerignore
- web/vite.config.ts
- web/src/App.tsx

### 修改文件数: 3
- web/src/services/aiService.ts
- backend/src/index.ts (可选，不是必须)
- backend/package.json

### 删除目录: 2
- electron/
- 大部分 scripts/ 中的 Windows 脚本

---

## 🎯 预期成果

### 本地开发
```bash
cd /code/backend
docker-compose up -d

# 访问 http://localhost
# API: http://localhost/api/dream-chat
```

### 生产部署
```bash
# 服务器上
git clone <repo>
cd backend

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入真实的 API KEY 和域名

# 启动
docker-compose -f docker-compose.prod.yml up -d

# 访问 https://your-domain.com
```

### 性能指标
- 前端加载时间: < 2s
- API 响应时间: < 5s (取决于 DeepSeek)
- 静态文件大小: ~ 150KB
- Docker 镜像大小: ~ 250MB

---

## 📚 相关文档

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Vite 官方文档](https://vitejs.dev/)
- [Express 官方文档](https://expressjs.com/)

---

**计划版本**: v1.0
**最后更新**: 2025-01-21
**状态**: 📋 待执行
