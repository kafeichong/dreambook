# DreamBook 服务器部署

服务器端部署配置和文档

## 部署架构

```
用户请求
   ↓
现有 Nginx 容器 (emotion-library-nginx-prod)
   ├─→ emotion-library 项目
   ├─→ DreamBook 前端（静态文件）     ← 新增
   └─→ DreamBook 后端容器 :3001       ← 新增
          ↓
       DeepSeek API
```

## 快速部署

### 1. 准备环境

```bash
# 确保已安装 Docker 和 Docker Compose
docker --version
docker-compose --version

# 克隆或上传代码
cd ~/dreambook/deploy
```

### 2. 部署后端容器

```bash
# 配置环境变量
cp .env.example .env
vim .env

# 必须填写：
# DEEPSEEK_API_KEY=sk_your_key_here
# CORS_ORIGIN=https://your-domain.com

# 构建并启动后端
docker-compose up -d

# 验证后端
curl http://localhost:3001/health
```

### 3. 部署前端静态文件

```bash
# 构建前端
cd ../dreambook-web
npm install
npm run build

# 复制到现有 Nginx 容器
docker cp dist emotion-library-nginx-prod:/usr/share/nginx/html/dreambook

# 验证文件
docker exec emotion-library-nginx-prod ls -la /usr/share/nginx/html/dreambook/
```

### 4. 配置 Nginx

**选择方式A：独立域名（推荐）**

```bash
# 复制配置
docker cp nginx-configs/dreambook-独立域名.conf \
  emotion-library-nginx-prod:/etc/nginx/conf.d/dreambook.conf

# 修改域名
docker exec -it emotion-library-nginx-prod \
  sed -i 's/dream.yourdomain.com/your-actual-domain.com/g' \
  /etc/nginx/conf.d/dreambook.conf

# 测试配置
docker exec emotion-library-nginx-prod nginx -t

# 重载 Nginx
docker exec emotion-library-nginx-prod nginx -s reload
```

**选择方式B：子路径**

参考 `nginx-configs/dreambook-子路径.conf`，手动添加到现有配置文件中。

### 5. 配置 DNS（如果使用独立域名）

```
A 记录: dream.yourdomain.com → 服务器IP
```

### 6. 验证部署

```bash
# 测试后端
curl http://localhost:3001/health

# 测试前端（根据你的域名）
curl -I http://dream.yourdomain.com/

# 测试完整流程
curl -X POST http://dream.yourdomain.com/api/dream-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"测试"}'
```

## 更新部署

### 只更新前端

```bash
cd dreambook-web
git pull
npm run build
docker cp dist emotion-library-nginx-prod:/usr/share/nginx/html/dreambook
docker exec emotion-library-nginx-prod nginx -s reload
```

### 只更新后端

```bash
cd deploy
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

## 监控和维护

### 查看日志

```bash
# 后端日志
docker logs -f dreambook-backend

# Nginx 访问日志
docker exec emotion-library-nginx-prod tail -f /var/log/nginx/dreambook-access.log
```

详见完整文档...
