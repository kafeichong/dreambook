# DreamBook API

梦境解析后端服务 - DeepSeek API 代理

## 功能

- 接收前端的梦境描述请求
- 调用 DeepSeek API 进行梦境解析
- 返回 AI 解析结果
- 提供健康检查接口

## 技术栈

- Node.js 20
- Express.js
- TypeScript
- DeepSeek API

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，填写 DEEPSEEK_API_KEY

# 启动开发服务器
npm run dev

# 访问
curl http://localhost:3000/health
```

## 构建

```bash
npm run build
# 产物在 dist/ 目录
```

## API 接口

### GET /health
健康检查接口

**响应**:
```json
{
  "status": "ok",
  "timestamp": 1706345678000,
  "version": "1.0.0"
}
```

### POST /api/dream-chat
梦境解析接口

**请求**:
```json
{
  "question": "我梦见了..."
}
```

**响应**:
```json
{
  "answer": "AI 解析结果..."
}
```

## 部署

使用 Docker 容器部署，详见 `../deploy/README.md`

## 环境变量

- `NODE_ENV`: 运行环境 (development/production)
- `PORT`: 服务端口 (默认 3000)
- `DEEPSEEK_API_KEY`: DeepSeek API 密钥（必需）
- `CORS_ORIGIN`: 允许的 CORS 域名

## 资源占用

- 内存：~50MB
- Docker 镜像：~40MB
