#!/bin/bash

# 梦境解析 - 开发环境一键启动脚本
# 同时启动后端服务和 Electron 应用

echo "🚀 启动开发环境..."

# 获取脚本所在目录的父目录（项目根目录）
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "📂 项目目录: $PROJECT_ROOT"

# 检查后端依赖
if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
  echo "⚠️  后端依赖未安装，正在安装..."
  cd "$PROJECT_ROOT/backend"
  npm install
fi

# 检查前端依赖
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  echo "⚠️  前端依赖未安装，正在安装..."
  cd "$PROJECT_ROOT"
  npm install
fi

# 启动后端服务（后台）
echo "🔧 启动后端服务..."
cd "$PROJECT_ROOT/backend"
npm run dev > "$PROJECT_ROOT/backend-dev.log" 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "   日志文件: backend-dev.log"

# 等待后端服务启动
echo "⏳ 等待后端服务就绪..."
sleep 3

# 启动 Electron 应用
echo "🖥️  启动 Electron 应用..."
cd "$PROJECT_ROOT"
npm run electron:dev

# 清理：当 Electron 退出时，关闭后端服务
echo ""
echo "🛑 正在关闭后端服务..."
kill $BACKEND_PID 2>/dev/null
echo "✅ 开发环境已关闭"
