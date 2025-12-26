# Electron 打包方式说明

## 📦 当前打包方式

本项目使用的是**静态文件打包方式**，这是 Electron 应用的标准做法。

### 两种常见的打包方式对比

#### 方式 1：静态文件方式（当前使用）✅ 推荐

**工作原理**：
- **开发环境**：Electron 连接到 Vite 开发服务器（`http://localhost:5173`）
- **生产环境**：直接加载打包后的静态文件（使用 `file://` 协议）

**代码实现**：
```typescript
if (isDev) {
  // 开发环境：连接开发服务器
  mainWindow.loadURL('http://localhost:5173')
} else {
  // 生产环境：直接加载静态文件
  const htmlPath = join(app.getAppPath(), 'dist', 'index.html')
  mainWindow.loadFile(htmlPath)
}
```

**优点**：
- ✅ 启动速度快（无需启动服务器）
- ✅ 资源占用少（不需要服务器进程）
- ✅ 更符合 Electron 标准做法
- ✅ 适合触摸屏应用（快速启动）
- ✅ 应用体积更小

**缺点**：
- ⚠️ 需要注意路径问题（已通过 `base: './'` 和 `getAssetPath()` 解决）
- ⚠️ `file://` 协议有一些限制（CORS、某些 API 限制，但对我们项目影响不大）

#### 方式 2：本地服务器方式（不推荐）

**工作原理**：
- **开发环境**：Electron 连接到 Vite 开发服务器
- **生产环境**：启动一个内嵌的本地 HTTP 服务器（如 Express），然后连接 `http://localhost:随机端口`

**代码实现**：
```typescript
if (isDev) {
  mainWindow.loadURL('http://localhost:5173')
} else {
  // 启动内嵌服务器
  const server = createServer() // 需要额外的服务器代码
  server.listen(0, () => {
    const port = server.address().port
    mainWindow.loadURL(`http://localhost:${port}`)
  })
}
```

**优点**：
- ✅ 与开发环境完全一致
- ✅ 避免 `file://` 协议的限制

**缺点**：
- ❌ 启动速度慢（需要启动服务器）
- ❌ 资源占用多（额外的服务器进程）
- ❌ 实现复杂（需要管理服务器生命周期）
- ❌ 增加应用体积
- ❌ 端口冲突风险

## ✅ 当前方式是正确的

**为什么静态文件方式更适合本项目？**

1. **触摸屏应用特点**：
   - 需要快速启动（用户期望立即响应）
   - 长期运行（不需要频繁重启）
   - 资源有限（触摸屏设备性能可能有限）

2. **项目特点**：
   - 纯前端应用（没有后端 API 需求）
   - 静态资源（图片、动画等）
   - 不需要动态服务器功能

3. **路径问题已解决**：
   - ✅ Vite 配置：`base: './'`（相对路径）
   - ✅ 工具函数：`getAssetPath()`（自动处理路径）
   - ✅ Router 配置：`HashRouter`（兼容 file:// 协议）

## 📋 当前配置检查清单

### 开发环境
- ✅ 使用 Vite 开发服务器（`http://localhost:5173`）
- ✅ 支持热重载和快速开发

### 生产环境
- ✅ 使用静态文件（`file://` 协议）
- ✅ 资源路径使用相对路径（`base: './'`）
- ✅ 资源路径工具函数（`getAssetPath()`）
- ✅ Router 使用 HashRouter（兼容 file://）

## 🔍 如何验证打包方式

### 检查打包后的应用

```bash
# 构建应用
yarn build
yarn electron:build

# 查看打包后的文件结构
ls -la release/mac-arm64/梦境解析.app/Contents/Resources/app.asar
```

打包后的应用结构：
```
app.asar/
├── dist/              # 静态文件（HTML、CSS、JS、图片等）
│   ├── index.html
│   └── assets/
└── dist-electron/     # Electron 主进程和预加载脚本
    ├── main.js
    └── preload.js
```

### 运行时的行为

1. **开发环境** (`yarn electron:dev`)：
   - 启动 Vite 服务器（`http://localhost:5173`）
   - Electron 连接到开发服务器
   - 支持热重载

2. **生产环境** (运行打包后的应用)：
   - 直接加载 `app.asar/dist/index.html`
   - 使用 `file://` 协议
   - 不需要额外的服务器进程

## 📚 参考信息

### Electron 官方推荐

Electron 官方文档推荐使用静态文件方式：
- 使用 `BrowserWindow.loadFile()` 加载本地 HTML 文件
- 这是最标准、最简单的做法

### 何时需要使用本地服务器？

只有在以下情况下才考虑本地服务器方式：
- 需要动态生成内容
- 需要 WebSocket 实时通信
- 需要服务端渲染（SSR）
- 有复杂的后端逻辑

对于纯前端应用（如本项目），静态文件方式是**最佳选择**。

## 🎯 总结

**当前打包方式是正确且推荐的！**

- ✅ 使用静态文件方式
- ✅ 开发环境使用开发服务器
- ✅ 生产环境使用静态文件
- ✅ 路径问题已妥善解决

不需要启动本地服务器，当前配置已经完全满足需求，并且是 Electron 应用的标准做法。

