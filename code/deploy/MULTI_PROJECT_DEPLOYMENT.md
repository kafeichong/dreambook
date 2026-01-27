# 多项目共享 Nginx 部署方案

## 🎯 场景分析

**现状**：
- 服务器已有 Nginx（可能是容器或物理机安装）
- 已有其他项目在运行
- 需要部署 DreamBook 项目
- 不同项目可能有不同域名

**目标**：
- 复用现有 Nginx，节省资源
- DreamBook 后端独立容器
- 支持多域名/子域名

---

## 方案对比

| 方案 | 架构 | 资源占用 | 复杂度 | 推荐度 |
|------|------|---------|--------|--------|
| **方案1** | 共享 Nginx | 最低（~50MB） | 简单 | ⭐⭐⭐⭐⭐ |
| **方案2** | 独立 Nginx 容器 + 不同端口 | 中等（~100MB） | 中等 | ⭐⭐⭐⭐ |
| **方案3** | Traefik 统一管理 | 高（~150MB+） | 复杂 | ⭐⭐⭐ |

---

## 🏆 方案1：共享现有 Nginx（强烈推荐）

### 架构图

```
用户请求
   ↓
现有 Nginx (物理机/容器)
   ├─→ 项目A (域名A / 路径 /projectA)
   ├─→ DreamBook 前端 (域名B / 路径 /dreambook)
   └─→ DreamBook 后端容器 :3000 (代理 /api)
```

### 优势
- ✅ 只增加 ~50MB (后端容器)
- ✅ 配置简单，维护方便
- ✅ 统一的 SSL 证书管理
- ✅ 统一的日志管理

### 部署步骤

#### 1. 确认现有 Nginx 类型

```bash
# 检查 Nginx 是容器还是物理机安装
docker ps | grep nginx          # 容器方式
systemctl status nginx          # 物理机安装
nginx -v                        # 查看版本
```

#### 2. 只部署后端容器

**简化的 docker-compose.yml**:
```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dreambook-backend
    ports:
      - "127.0.0.1:3001:3000"  # 只监听本地，避免冲突
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - TZ=Asia/Shanghai
    restart: always
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 10s
      retries: 3
```

启动后端：
```bash
# 构建并启动后端容器
docker build -t dreambook-backend:latest -f Dockerfile .
docker-compose up -d backend

# 验证后端
curl http://localhost:3001/health
```

#### 3. 部署前端静态文件

```bash
# 构建前端
cd src/web
npm install
npm run build

# 复制到 Nginx 静态文件目录
# 方式A: 独立域名（推荐）
sudo mkdir -p /var/www/dreambook
sudo cp -r dist/* /var/www/dreambook/

# 方式B: 子路径部署
sudo mkdir -p /var/www/html/dreambook
sudo cp -r dist/* /var/www/html/dreambook/
```

#### 4. 配置现有 Nginx

**情况A：独立域名部署** (如 `dream.example.com`)

创建配置文件：`/etc/nginx/sites-available/dreambook.conf`

```nginx
# DreamBook 独立域名配置
server {
    listen 80;
    server_name dream.example.com;  # 你的域名

    # 前端静态文件
    root /var/www/dreambook;
    index index.html;

    # 启用 Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
    }

    # API 代理到后端容器
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
    }
}
```

**情况B：子路径部署** (如 `example.com/dreambook`)

在现有配置文件中添加：

```nginx
server {
    listen 80;
    server_name example.com;  # 现有域名

    # ... 现有项目配置 ...

    # DreamBook 子路径
    location /dreambook {
        alias /var/www/html/dreambook;
        try_files $uri $uri/ /dreambook/index.html;

        # 注意：前端需要设置 base path
    }

    # DreamBook API
    location /dreambook/api/ {
        rewrite ^/dreambook/api/(.*) /api/$1 break;
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # DreamBook 健康检查
    location /dreambook/health {
        proxy_pass http://127.0.0.1:3001/health;
    }
}
```

#### 5. 启用配置并重启 Nginx

```bash
# 如果是物理机 Nginx
sudo ln -s /etc/nginx/sites-available/dreambook.conf /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl reload nginx

# 如果是 Nginx 容器
docker exec nginx-container nginx -t
docker exec nginx-container nginx -s reload
```

#### 6. 配置 DNS（如果是独立域名）

```
A 记录: dream.example.com → 服务器IP
```

#### 7. 验证部署

```bash
# 测试健康检查
curl http://dream.example.com/health

# 测试前端
curl -I http://dream.example.com/

# 测试 API
curl -X POST http://dream.example.com/api/dream-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"测试"}'
```

---

## 🔧 方案2：独立 Nginx 容器 + 不同端口

### 架构图

```
用户请求
   ↓
现有 Nginx :80 (主入口)
   ├─→ 项目A
   └─→ 反向代理 :8080 → DreamBook Nginx 容器
                          ├─ 前端静态文件
                          └─ 代理 → 后端容器 :3000
```

### 部署步骤

#### 1. 使用完整的 docker-compose

修改端口不冲突：

```yaml
services:
  nginx:
    build:
      context: .
      dockerfile: nginx/Dockerfile
    container_name: dreambook-nginx
    ports:
      - "8080:80"  # 使用 8080 避免冲突
    volumes:
      - ./src/web/dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
    restart: always

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dreambook-backend
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
    restart: always
```

启动：
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. 在主 Nginx 添加反向代理

```nginx
# 方式A: 独立域名
server {
    listen 80;
    server_name dream.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 方式B: 子路径
server {
    listen 80;
    server_name example.com;

    location /dreambook/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🌟 方案3：使用 Traefik 统一管理（高级）

适合有多个项目需要统一管理的场景。

### 架构图

```
Traefik 容器 :80, :443 (自动路由，自动 SSL)
   ├─→ 项目A容器 (label: traefik.host=projecta.com)
   └─→ DreamBook (label: traefik.host=dream.com)
       ├─ Nginx 容器
       └─ 后端容器
```

配置较复杂，如有需要可以详细说明。

---

## 💡 推荐选择

### 场景1：有独立域名
**选择方案1** - 共享 Nginx + 独立域名配置
- 最节省资源
- 配置简单
- 便于管理 SSL 证书

### 场景2：使用子路径
**选择方案1** - 共享 Nginx + 子路径配置
- 需要修改前端构建配置（设置 base path）
- 其他与独立域名相同

### 场景3：想完全隔离
**选择方案2** - 独立容器 + 主 Nginx 反向代理
- 项目完全独立
- 稍微多占用一些资源

---

## 📋 资源占用对比

| 方案 | CPU | 内存 | 磁盘 | 容器数量 |
|------|-----|------|------|---------|
| **方案1（共享）** | 极低 | ~50MB | ~50MB | 1个 |
| **方案2（独立）** | 低 | ~100MB | ~100MB | 2个 |
| 原方案（独立Nginx） | 低 | ~100MB | ~100MB | 2个 |

---

## 🔐 SSL 证书配置（可选）

如果使用独立域名，配置 HTTPS：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 自动配置 SSL
sudo certbot --nginx -d dream.example.com

# 自动续期
sudo certbot renew --dry-run
```

---

## ✅ 最终建议

**我的推荐**：使用 **方案1 + 独立域名**

理由：
1. ✅ 只需 1 个后端容器（~50MB）
2. ✅ 复用现有 Nginx，不浪费资源
3. ✅ 配置简单，维护方便
4. ✅ 独立域名，互不干扰
5. ✅ 统一管理 SSL 证书

**你需要做的**：
1. 确认现有 Nginx 类型（容器 or 物理机）
2. 告诉我是用独立域名还是子路径
3. 我帮你生成对应的配置文件

需要我根据你的实际情况生成具体的配置吗？
