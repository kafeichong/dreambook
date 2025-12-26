# Electron 配置说明

## 文件结构

- `main.ts` - Electron 主进程文件，负责创建和管理应用窗口
- `preload.ts` - 预加载脚本，用于在渲染进程中安全地暴露 Node.js API
- `tsconfig.json` - TypeScript 配置文件

## 触摸屏优化特性

1. **全屏模式** - 应用默认以全屏模式启动
2. **无边框窗口** - 移除窗口边框，提供沉浸式体验
3. **禁用菜单栏** - 移除默认菜单栏，适合触摸屏操作
4. **硬件加速** - 启用 GPU 加速以提升性能
5. **锁定模式** - 可以启用 kiosk 模式完全锁定系统（可选）

## 开发模式

```bash
yarn electron:dev
```

这将：
1. 构建 Electron 主进程文件
2. 启动 Vite 开发服务器
3. 等待服务器就绪后启动 Electron 窗口

## 打包应用

```bash
# 构建并打包（生成安装包）
yarn electron:pack

# 仅构建可执行文件目录（不生成安装包，用于测试）
yarn electron:build:dir
```

打包后的文件将位于 `release/` 目录。

## 配置说明

### 启用 Kiosk 模式

如果需要完全锁定系统（防止用户退出应用），可以在 `main.ts` 中将 `kiosk` 设置为 `true`：

```typescript
kiosk: true, // 完全锁定模式
```

### 打开开发者工具

开发时如果需要调试，可以取消注释 `main.ts` 中的相关行：

```typescript
mainWindow.webContents.openDevTools()
```

### 自定义窗口大小

如果需要固定窗口大小而非全屏，可以修改 `createWindow` 函数中的窗口配置。

