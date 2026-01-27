# DreamBook 项目结构优化方案

## 📋 调整背景

### 实际部署需求：
1. **服务器端**：
   - 后端 API：独立 Docker 容器
   - 前端 Web：静态文件 → 复用现有 Nginx 容器（emotion-library-nginx-prod）

2. **触摸屏端**：
   - Electron 应用：打包成 `.exe` → Windows 10 安装
   - 不需要服务器，不需要 Docker

### 当前问题：
- ❌ `backend/` 目录包含前后端，名字不准确
- ❌ 前端在 `backend/web/`，逻辑混乱
- ❌ Electron 项目名 `dreambook` 不够清晰
- ❌ 文档、demo、temp 混在根目录

---

## 🎯 目标结构

```
code/
├── dreambook-api/              # 后端 API（需要 Docker）
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── prompts/
│   │   ├── types/
│   │   └── config.ts
│   ├── Dockerfile             ✅ 只有后端需要
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── dreambook-web/              # 网页前端（纯静态文件）
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── public/
│   ├── dist/                  ✅ 构建产物，复制到 Nginx
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md              ❌ 不需要 Dockerfile
│
├── dreambook-kiosk/            # Electron 触摸屏（打包 exe）
│   ├── src/
│   ├── electron/
│   ├── public/
│   ├── package.json
│   └── README.md              ❌ 不需要 Docker
│
├── deploy/                     # 服务器部署配置
│   ├── docker-compose.yml     # 只管理后端容器
│   ├── nginx-configs/          # Nginx 配置示例
│   │   ├── dreambook-独立域名.conf
│   │   └── dreambook-子路径.conf
│   ├── .env.example
│   ├── DEPLOYMENT.md
│   └── README.md
│
└── _archive/                   # 归档文件
    ├── docs/
    ├── demo/
    └── temp/
```

---

## 📝 详细调整步骤

### 第一步：备份

```bash
cd /Users/steven/works/20251130dreambook/code/
git add .
git commit -m "重构前备份"
```

### 第二步：创建新目录

```bash
mkdir dreambook-api
mkdir dreambook-web
mkdir deploy
mkdir deploy/nginx-configs
```

### 第三步：移动后端代码

```bash
# 后端源码
cp -r backend/src dreambook-api/

# 后端配置
cp backend/package.json dreambook-api/
cp backend/tsconfig.json dreambook-api/
cp backend/Dockerfile dreambook-api/
cp backend/.env.example dreambook-api/
cp backend/yarn.lock dreambook-api/ 2>/dev/null || true
cp backend/package-lock.json dreambook-api/ 2>/dev/null || true

# 后端构建产物（如果存在）
cp -r backend/dist dreambook-api/ 2>/dev/null || true
```

### 第四步：移动前端代码

```bash
# 前端所有文件
cp -r backend/web/* dreambook-web/
cp -r backend/web/.* dreambook-web/ 2>/dev/null || true
```

### 第五步：移动部署配置

```bash
# Docker Compose 配置
cp backend/docker-compose.yml deploy/ 2>/dev/null || true
cp backend/docker-compose.prod.yml deploy/ 2>/dev/null || true
cp backend/docker-compose.shared-nginx.yml deploy/ 2>/dev/null || true

# Nginx 配置
cp -r backend/nginx-configs/* deploy/nginx-configs/ 2>/dev/null || true

# 环境变量示例
cp backend/.env.example deploy/

# 文档
cp backend/DEPLOYMENT.md deploy/ 2>/dev/null || true
cp backend/QUICKSTART.md deploy/ 2>/dev/null || true
cp backend/DOCKER_SUMMARY.md deploy/ 2>/dev/null || true
cp backend/MULTI_PROJECT_DEPLOYMENT.md deploy/ 2>/dev/null || true
```

### 第六步：重命名 Electron 项目

```bash
mv dreambook dreambook-kiosk
```

### 第七步：归档不需要的文件

```bash
mkdir _archive
mv docs _archive/ 2>/dev/null || true
mv demo _archive/ 2>/dev/null || true
mv temp _archive/ 2>/dev/null || true
```

### 第八步：删除旧的 backend 目录

```bash
rm -rf backend/
```

### 第九步：创建 README 文件

为每个项目创建清晰的 README.md，说明功能、开发和部署方式。

### 第十步：更新部署配置

修改 `deploy/docker-compose.yml`，将路径指向新的结构。

### 第十一步：提交更改

```bash
git add .
git commit -m "重构：完全分离项目结构

- dreambook-api: 后端 API（Docker 部署）
- dreambook-web: 网页前端（静态文件）
- dreambook-kiosk: Electron 触摸屏（exe）
- deploy: 服务器部署配置"

git push
```

---

## 🚀 调整后的部署流程

### 服务器端部署

#### 1. 部署后端 Docker 容器

```bash
cd deploy/
cp .env.example .env
vim .env  # 填写 DEEPSEEK_API_KEY

docker-compose up -d
curl http://localhost:3001/health
```

#### 2. 构建并部署前端静态文件

```bash
# 构建前端
cd ../dreambook-web/
npm install
npm run build

# 复制到现有 Nginx
docker cp dist emotion-library-nginx-prod:/usr/share/nginx/html/dreambook

# 配置 Nginx
cd ../deploy/
docker cp nginx-configs/dreambook-独立域名.conf \
  emotion-library-nginx-prod:/etc/nginx/conf.d/dreambook.conf

# 重载 Nginx
docker exec emotion-library-nginx-prod nginx -t
docker exec emotion-library-nginx-prod nginx -s reload
```

### 触摸屏端部署

```bash
cd dreambook-kiosk/
npm install
npm run electron:build:win

# 将 release/*.exe 复制到触摸屏电脑安装
```

---

## 📊 部署架构图

```
服务器端：
┌─────────────────────────────────────┐
│  emotion-library-nginx-prod (现有)  │
├─────────────────────────────────────┤
│  /emotion-library/  → 原有项目      │
│  /dreambook/        → 新增静态文件  │
└──────────────┬──────────────────────┘
               │ 反向代理
               ↓
┌─────────────────────────────────────┐
│  dreambook-backend (Docker)         │
│  Port: 127.0.0.1:3001               │
│  DeepSeek API 代理                  │
└─────────────────────────────────────┘

触摸屏端：
┌─────────────────────────────────────┐
│  Windows 10 触摸屏                  │
│  DreamBook.exe (Electron 应用)      │
│  独立运行，不依赖服务器              │
└─────────────────────────────────────┘
```

---

## 📦 各项目说明

### dreambook-api（后端 API）
- **功能**：DeepSeek API 代理，处理梦境解析请求
- **技术栈**：Node.js + Express + TypeScript
- **部署**：Docker 容器
- **资源占用**：~50MB 内存，~40MB 镜像
- **端口**：3001（只监听本地）

### dreambook-web（网页前端）
- **功能**：网页版梦境解析界面
- **技术栈**：React + Vite + TypeScript
- **部署**：静态文件，复制到现有 Nginx
- **资源占用**：~2-3MB（构建后）
- **访问**：通过 Nginx 代理

### dreambook-kiosk（触摸屏应用）
- **功能**：图书馆触摸屏版，全屏无边框
- **技术栈**：Electron + React
- **部署**：Windows 安装包（.exe）
- **资源占用**：不占用服务器资源
- **平台**：Windows 10

### deploy（部署配置）
- **功能**：服务器端部署配置和脚本
- **包含**：Docker Compose、Nginx 配置、部署文档
- **用途**：快速部署和更新

---

## ✅ 调整的好处

1. ✅ **职责清晰**：三个项目完全独立
2. ✅ **便于维护**：每个项目有独立的 README
3. ✅ **资源优化**：前端不需要独立 Docker 容器
4. ✅ **部署灵活**：可以独立更新前端或后端
5. ✅ **符合规范**：遵循业界最佳实践

---

## ⚠️ 注意事项

1. **Git 历史**：使用 `git mv` 保留文件历史
2. **依赖安装**：调整后需要重新 `npm install`
3. **路径检查**：确认没有硬编码的绝对路径
4. **环境变量**：每个项目的 .env 独立管理
5. **备份验证**：调整前确保有完整备份

---

## 🔄 回滚方案

如果调整后有问题，可以回滚：

```bash
git log  # 找到备份的 commit
git reset --hard <commit-id>
```

---

## 📞 调整后的快速命令

### 开发
```bash
# 后端
cd dreambook-api && npm run dev

# 前端
cd dreambook-web && npm run dev

# 触摸屏
cd dreambook-kiosk && npm run electron:dev
```

### 构建
```bash
# 后端
cd dreambook-api && npm run build

# 前端
cd dreambook-web && npm run build

# 触摸屏
cd dreambook-kiosk && npm run electron:build:win
```

### 部署
```bash
# 服务器后端
cd deploy && docker-compose up -d

# 服务器前端
cd dreambook-web && npm run build
docker cp dist emotion-library-nginx-prod:/usr/share/nginx/html/dreambook
```

---

调整完成后，项目结构将更加清晰、专业，便于长期维护！
