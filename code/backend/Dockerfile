# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制源代码
COPY src ./src
COPY tsconfig.json ./

# 编译 TypeScript
RUN npm run build

# ============ 运行阶段 ============
FROM node:20-alpine

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production

# 复制编译后的代码
COPY --from=builder /app/dist ./dist

# 更改所有权
RUN chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/index.js"]
