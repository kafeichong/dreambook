# DreamBook Docker 部署指南

## 📦 项目结构

```
backend/
├── Dockerfile              # 后端镜像
├── docker-compose.yml      # 开发环境配置
├── docker-compose.prod.yml # 生产环境配置
├── nginx/
│   ├── Dockerfile         # Nginx 镜像
│   └── nginx.conf         # Nginx 配置
├── src/                   # 后端源码
└── src/web/               # 前端源码（需要先构建）
```

## 📊 镜像大小预估

- **后端镜像**: ~40-45 MB
- **前端镜像**: ~45-50 MB
- **总磁盘占用**: ~150 MB (首次部署)
- **运行内存**: ~70-100 MB

---

## 🚀 部署步骤

### 第一步：准备服务器环境

```bash
# 1. 确保已安装 Docker 和 Docker Compose
docker --version
docker-compose --version

# 2. 创建项目目录
mkdir -p ~/dreambook
cd ~/dreambook
```

### 第二步：上传代码

```bash
# 方式1: 使用 Git（推荐）
git clone <your-repo-url> .

# 方式2: 使用 scp 上传
# 本地执行：
cd /path/to/backend
scp -r . user@server-ip:~/dreambook/

# 方式3: 使用 rsync（更高效）
rsync -avz --exclude 'node_modules' --exclude '.git' \
  . user@server-ip:~/dreambook/
```

### 第三步：构建前端

```bash
# 在服务器上执行
cd ~/dreambook

# 进入前端目录构建
cd src/web
npm install
npm run build

# 确认构建产物存在
ls -lh dist/

cd ../..  # 返回 backend 根目录
```

### 第四步：配置环境变量

```bash
# 创建生产环境配置
cp .env.example .env
vim .env

# 修改以下配置：
# NODE_ENV=production
# DEEPSEEK_API_KEY=sk_your_actual_api_key
# CORS_ORIGIN=https://your-domain.com  # 或 http://your-ip
```

### 第五步：构建 Docker 镜像

```bash
# 1. 构建后端镜像
docker build -t dreambook-backend:latest -f Dockerfile .

# 2. 构建前端镜像
docker build -t dreambook-nginx:latest -f nginx/Dockerfile .

# 3. 查看镜像
docker images | grep dreambook
```

预期输出：
```
dreambook-backend    latest    xxx    40-45MB
dreambook-nginx      latest    xxx    45-50MB
```

### 第六步：启动服务

```bash
# 使用生产环境配置启动
docker-compose -f docker-compose.prod.yml up -d

# 查看容器状态
docker-compose -f docker-compose.prod.yml ps
```

预期输出：
```
NAME                      STATUS         PORTS
dreambook-backend-prod    Up (healthy)   0.0.0.0:3000->3000/tcp
dreambook-nginx-prod      Up (healthy)   0.0.0.0:80->80/tcp
```

### 第七步：验证部署

```bash
# 1. 检查后端健康
curl http://localhost/health

# 预期输出：{"status":"ok","timestamp":...}

# 2. 检查前端
curl -I http://localhost/

# 预期输出：HTTP/1.1 200 OK

# 3. 测试 API
curl -X POST http://localhost/api/dream-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"测试"}'
```

### 第八步：配置防火墙（如需要）

```bash
# 开放 80 端口
sudo ufw allow 80/tcp

# 或者开放 443（HTTPS）
sudo ufw allow 443/tcp
```

---

## 🔧 日常维护命令

### 查看日志
```bash
# 查看所有日志
docker-compose -f docker-compose.prod.yml logs -f

# 只看后端日志
docker-compose -f docker-compose.prod.yml logs -f backend

# 只看前端日志
docker-compose -f docker-compose.prod.yml logs -f nginx

# 查看最近 100 行
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### 重启服务
```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 只重启后端
docker-compose -f docker-compose.prod.yml restart backend

# 只重启前端
docker-compose -f docker-compose.prod.yml restart nginx
```

### 停止服务
```bash
# 停止服务（保留容器）
docker-compose -f docker-compose.prod.yml stop

# 停止并删除容器
docker-compose -f docker-compose.prod.yml down

# 停止并删除所有（包括数据卷）
docker-compose -f docker-compose.prod.yml down -v
```

### 更新部署
```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建前端
cd src/web
npm install
npm run build
cd ../..

# 3. 重新构建镜像
docker build -t dreambook-backend:latest -f Dockerfile .
docker build -t dreambook-nginx:latest -f nginx/Dockerfile .

# 4. 重启服务
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 5. 验证
docker-compose -f docker-compose.prod.yml ps
curl http://localhost/health
```

### 清理旧镜像
```bash
# 清理未使用的镜像
docker image prune -f

# 清理所有未使用的资源
docker system prune -a
```

---

## 🛠️ 故障排查

### 服务无法启动
```bash
# 1. 查看详细日志
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs nginx

# 2. 检查容器状态
docker ps -a | grep dreambook

# 3. 进入容器检查
docker exec -it dreambook-backend-prod sh
docker exec -it dreambook-nginx-prod sh
```

### 后端 API 无响应
```bash
# 1. 检查后端容器是否运行
docker ps | grep backend

# 2. 检查后端日志
docker logs dreambook-backend-prod

# 3. 检查环境变量
docker exec dreambook-backend-prod env | grep DEEPSEEK

# 4. 手动测试后端
docker exec dreambook-backend-prod curl http://localhost:3000/health
```

### 前端无法访问
```bash
# 1. 检查 Nginx 配置
docker exec dreambook-nginx-prod nginx -t

# 2. 检查静态文件
docker exec dreambook-nginx-prod ls -la /usr/share/nginx/html/

# 3. 检查端口占用
netstat -tulpn | grep :80
```

### 网络问题
```bash
# 1. 检查网络
docker network ls
docker network inspect dreambook-network

# 2. 测试容器间通信
docker exec dreambook-nginx-prod ping backend
docker exec dreambook-nginx-prod curl http://backend:3000/health
```

---

## 🔐 安全建议

1. **使用 HTTPS**
   - 配置 SSL 证书（Let's Encrypt 免费）
   - 修改 nginx.conf 添加 HTTPS 监听

2. **限制端口访问**
   - 只开放 80/443 端口
   - 后端 3000 端口不要对外暴露

3. **环境变量保护**
   - `.env` 文件设置权限: `chmod 600 .env`
   - 不要把 `.env` 提交到 Git

4. **定期更新**
   - 定期更新基础镜像
   - 更新 Node.js 和依赖包

---

## 📈 监控和备份

### 监控容器资源
```bash
# 实时资源使用
docker stats

# 查看特定容器
docker stats dreambook-backend-prod dreambook-nginx-prod
```

### 备份镜像
```bash
# 保存镜像
docker save dreambook-backend:latest | gzip > dreambook-backend-backup.tar.gz
docker save dreambook-nginx:latest | gzip > dreambook-nginx-backup.tar.gz

# 恢复镜像
docker load < dreambook-backend-backup.tar.gz
docker load < dreambook-nginx-backup.tar.gz
```

### 备份数据
```bash
# 备份环境变量
cp .env .env.backup-$(date +%Y%m%d)

# 备份日志（如果有持久化）
docker-compose -f docker-compose.prod.yml logs > logs-backup-$(date +%Y%m%d).txt
```

---

## 🌐 配置域名（可选）

### 使用域名访问

1. **添加 DNS 记录**
   - A 记录: `example.com` → `服务器IP`

2. **修改环境变量**
   ```bash
   vim .env
   # CORS_ORIGIN=https://example.com
   ```

3. **配置 SSL（Let's Encrypt）**
   ```bash
   # 安装 certbot
   sudo apt install certbot python3-certbot-nginx

   # 获取证书
   sudo certbot --nginx -d example.com
   ```

4. **修改 nginx.conf 添加 HTTPS**

---

## 💡 性能优化建议

1. **Nginx 优化**
   - 已启用 gzip 压缩
   - 已配置静态文件缓存
   - 可增加 `worker_processes`

2. **后端优化**
   - 考虑添加 Redis 缓存
   - 使用 PM2 集群模式（需要修改 Dockerfile）

3. **镜像优化**
   - 使用多阶段构建（已使用）
   - 使用 alpine 基础镜像（已使用）
   - 定期清理未使用的层

---

## 📞 快速参考

| 操作 | 命令 |
|------|------|
| 启动服务 | `docker-compose -f docker-compose.prod.yml up -d` |
| 停止服务 | `docker-compose -f docker-compose.prod.yml down` |
| 查看日志 | `docker-compose -f docker-compose.prod.yml logs -f` |
| 重启服务 | `docker-compose -f docker-compose.prod.yml restart` |
| 查看状态 | `docker-compose -f docker-compose.prod.yml ps` |
| 健康检查 | `curl http://localhost/health` |
| 进入容器 | `docker exec -it dreambook-backend-prod sh` |

---

## ❓ 常见问题

**Q: 构建镜像时内存不足？**
A: 增加 swap 空间或使用更大内存的服务器

**Q: 端口 80 被占用？**
A: 修改 `docker-compose.prod.yml` 中的端口映射为其他端口

**Q: DEEPSEEK_API_KEY 无效？**
A: 检查 .env 文件，确保 API key 正确且有效

**Q: 前端页面空白？**
A: 检查前端是否正确构建，`src/web/dist` 目录是否存在

**Q: 跨域问题？**
A: 检查 `CORS_ORIGIN` 配置是否与访问域名一致
