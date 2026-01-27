# 🚀 快速部署清单

## 前置准备
- [ ] 服务器已安装 Docker 和 Docker Compose
- [ ] 获取 DeepSeek API Key: https://platform.deepseek.com/

---

## 部署步骤（5分钟）

### 1. 上传代码到服务器
```bash
# 本地打包
cd /path/to/backend
tar -czf dreambook.tar.gz .

# 上传到服务器
scp dreambook.tar.gz user@server:/tmp/

# 服务器解压
ssh user@server
mkdir -p ~/dreambook
cd ~/dreambook
tar -xzf /tmp/dreambook.tar.gz
```

### 2. 构建前端
```bash
cd ~/dreambook/src/web
npm install
npm run build
cd ../..
```

### 3. 配置环境变量
```bash
cp .env.example .env
vim .env

# 必须修改：
# DEEPSEEK_API_KEY=sk_your_key_here
# CORS_ORIGIN=http://your-server-ip
```

### 4. 构建并启动
```bash
# 构建镜像
docker build -t dreambook-backend:latest -f Dockerfile .
docker build -t dreambook-nginx:latest -f nginx/Dockerfile .

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看状态
docker-compose -f docker-compose.prod.yml ps
```

### 5. 验证
```bash
# 健康检查
curl http://localhost/health

# 测试前端
curl -I http://localhost/

# 测试 API
curl -X POST http://localhost/api/dream-chat \
  -H "Content-Type: application/json" \
  -d '{"question":"你好"}'
```

---

## 常用命令

```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 更新代码后重新部署
git pull
cd src/web && npm run build && cd ../..
docker-compose -f docker-compose.prod.yml down
docker build -t dreambook-backend:latest -f Dockerfile .
docker build -t dreambook-nginx:latest -f nginx/Dockerfile .
docker-compose -f docker-compose.prod.yml up -d
```

---

## 访问地址

- **Web 界面**: `http://your-server-ip/`
- **健康检查**: `http://your-server-ip/health`
- **API 接口**: `http://your-server-ip/api/dream-chat`

---

## 故障排查

如果服务无法访问：

1. 检查容器是否运行: `docker ps`
2. 查看日志: `docker-compose -f docker-compose.prod.yml logs`
3. 检查端口: `netstat -tulpn | grep 80`
4. 检查防火墙: `sudo ufw status`

详细文档请查看: `DEPLOYMENT.md`
