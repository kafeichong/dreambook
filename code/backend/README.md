# DreamBook 网页版 - 部署指南

> AI 梦境解析应用 - Nginx + Express + Docker 架构

## 📋 快速开始

### 前置条件
- Docker & Docker Compose
- Node.js 20+ (本地开发)
- DeepSeek API 密钥

### 本地开发

**第一步：安装依赖**
```bash
cd /code/backend/web
npm install

cd /code/backend
npm install
```

**第二步：构建前端**
```bash
cd web
npm run build
```

**第三步：配置环境变量**
```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env，填入你的 API 密钥
# DEEPSEEK_API_KEY=sk_your_api_key
```

**第四步：启动 Docker**
```bash
# 在 /code/backend 目录下运行
docker-compose up -d

# 查看日志
docker-compose logs -f
```

**第五步：访问应用**
- 打开浏览器访问: http://localhost
- API 文档: http://localhost/api/dream-chat (POST)
- 健康检查: http://localhost/health

---

## 🚀 生产部署

### 在服务器上部署

**第一步：克隆仓库**
```bash
git clone <your-repo-url>
cd backend
```

**第二步：配置环境**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env

# 必填项：
# - DEEPSEEK_API_KEY: 你的 DeepSeek API 密钥
# - CORS_ORIGIN: 你的域名（例如 https://dreambook.example.com）
```

**第三步：构建前端（可选，推荐在 CI/CD 中完成）**
```bash
cd web
npm ci
npm run build
cd ..
```

**第四步：启动应用**
```bash
# 使用生产配置
docker-compose -f docker-compose.prod.yml up -d

# 查看状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

**第五步：配置反向代理（可选，如果使用 Nginx 前置）**

```nginx
upstream dreambook {
  server your-server-ip;
}

server {
  listen 443 ssl http2;
  server_name dreambook.example.com;

  ssl_certificate /etc/ssl/certs/your-cert.pem;
  ssl_certificate_key /etc/ssl/private/your-key.pem;

  location / {
    proxy_pass http://dreambook;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## 📱 访问二维码

将以下 URL 编码为二维码供用户扫描：
```
https://your-domain.com
```

用户扫描后可直接访问网页版应用。

---

## 🔧 常见问题

### Q1: 如何更新前端代码？
```bash
cd web
npm run build
docker-compose -f docker-compose.prod.yml restart nginx
```

### Q2: 如何更新后端代码？
```bash
# 更新源代码后
docker-compose -f docker-compose.prod.yml restart backend
```

### Q3: 如何查看错误日志？
```bash
# 查看所有日志
docker-compose -f docker-compose.prod.yml logs

# 查看特定服务
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs nginx
```

### Q4: 如何停止应用？
```bash
docker-compose -f docker-compose.prod.yml down
```

### Q5: 如何完全清理并重新部署？
```bash
# 停止并删除容器和网络
docker-compose -f docker-compose.prod.yml down

# 删除镜像（可选）
docker-compose -f docker-compose.prod.yml down --rmi all

# 重新构建和启动
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📊 架构说明

```
用户浏览器 (手机/电脑)
    ↓
Nginx (80/443)
    ├─→ 静态文件 (React 应用)
    └─→ /api/* → Express (3000)
            ↓
        DeepSeek API
```

### 服务说明

| 服务 | 端口 | 功能 |
|------|------|------|
| Nginx | 80 | 反向代理 + 静态文件托管 |
| Express | 3000 | API 服务 |
| DeepSeek | - | 梦境解析 AI |

---

## 🔐 安全建议

1. **API 密钥**：不要在代码中硬编码，使用环境变量
2. **CORS**：配置 `CORS_ORIGIN` 为你的域名，防止跨域滥用
3. **HTTPS**：生产环境必须使用 HTTPS
4. **认证**：可选，考虑为 API 添加速率限制或认证

---

## 📈 性能优化

### 缓存策略
- HTML: 1 小时缓存
- JS/CSS: 7 天缓存（文件名含 hash）
- 图片: 7 天缓存

### 压缩
- Nginx 启用 GZIP 压缩
- 前端 Vite 自动代码分割

### 监控
使用 `docker stats` 监控资源使用：
```bash
docker stats dreambook-nginx-prod dreambook-backend-prod
```

---

## 🐛 调试

### 本地开发调试
```bash
# 查看实时日志
docker-compose logs -f backend
docker-compose logs -f nginx

# 进入容器
docker-compose exec backend sh
docker-compose exec nginx sh
```

### 检查网络
```bash
# 检查 DNS
docker-compose exec backend nslookup backend

# 检查连接
docker-compose exec backend curl http://backend:3000/health
```

---

## 📝 环境变量详解

| 变量 | 示例 | 说明 |
|------|------|------|
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `3000` | API 服务端口 |
| `DEEPSEEK_API_KEY` | `sk_xxx` | DeepSeek API 密钥 |
| `CORS_ORIGIN` | `https://example.com` | CORS 允许的域名 |
| `VITE_API_URL` | `https://api.example.com` | 前端 API 地址（可选） |

---

## 📚 相关文档

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
- [Express 官方文档](https://expressjs.com/)
- [DeepSeek API 文档](https://platform.deepseek.com/)

---

## 📞 支持

有问题？请检查：
1. 环境变量是否正确设置
2. DeepSeek API 是否可用
3. 网络连接是否正常
4. Docker 日志是否有错误

---

**最后更新**: 2026-01-21
**版本**: v1.0.0
