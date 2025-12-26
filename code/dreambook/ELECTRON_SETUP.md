# Electron 集成说明

本项目已集成 Electron，可以将 Web 应用打包为桌面应用，适用于图书馆触摸屏设备。

## 📦 安装依赖

首次使用前，请安装所有依赖（包括新增的 Electron 相关依赖）：

```bash
yarn install
```

## 🚀 开发模式

在开发模式下运行 Electron 应用：

```bash
yarn electron:dev
```

这个命令会：
1. 构建 Electron 主进程文件到 `dist-electron/` 目录
2. 启动 Vite 开发服务器（http://localhost:5173）
3. 等待服务器就绪后自动打开 Electron 窗口

## 🏗️ 构建应用

### 构建 Web 资源和 Electron 文件

```bash
yarn build
```

这会构建：
- React 应用到 `dist/` 目录
- Electron 主进程和预加载脚本到 `dist-electron/` 目录

### 仅构建 Electron 文件

```bash
yarn build:electron
```

## 📦 打包桌面应用

### 生成安装包

```bash
yarn electron:pack
```

这会生成对应平台的安装包：
- **Windows**: NSIS 安装程序（`.exe`）
- **macOS**: DMG 安装包
- **Linux**: AppImage 可执行文件

打包后的文件位于 `release/` 目录。

### 仅构建可执行文件（不生成安装包）

用于快速测试：

```bash
yarn electron:build:dir
```

## 🎯 触摸屏优化特性

应用已针对触摸屏设备进行优化：

1. **全屏模式** - 应用自动以全屏模式启动
2. **无边框窗口** - 移除窗口边框，提供沉浸式体验
3. **禁用菜单栏** - 移除默认菜单栏，防止误操作
4. **硬件加速** - 启用 GPU 加速，提升动画性能
5. **固定窗口大小** - 禁止调整窗口大小

### 启用 Kiosk 模式

如果需要完全锁定系统（防止用户退出应用），可以修改 `electron/main.ts`：

```typescript
kiosk: true, // 完全锁定模式
```

## 🔧 配置文件说明

- `electron/main.ts` - Electron 主进程入口文件
- `electron/preload.ts` - 预加载脚本（安全地暴露 Node.js API 给渲染进程）
- `scripts/build-electron.ts` - Electron 文件构建脚本
- `package.json` - 包含 Electron 打包配置（`build` 字段）

## 📝 打包配置

打包配置位于 `package.json` 的 `build` 字段，可以根据需要调整：

- 应用 ID 和名称
- 图标路径
- 输出目录
- 安装包选项

## ⚠️ 注意事项

1. **图标文件**: 确保 `public/logo.png` 存在，或者修改 `package.json` 中的 `icon` 路径
2. **路径问题**: 如果打包后无法加载页面，检查 `electron/main.ts` 中的路径配置
3. **开发者工具**: 开发时可以在 `main.ts` 中取消注释以打开开发者工具进行调试

## 🐛 故障排除

### 打包后无法加载页面

检查以下几点：
1. 确保 `dist/` 目录已生成
2. 检查 `dist-electron/` 目录中的文件
3. 查看 Electron 控制台错误信息

### 开发模式下 Electron 无法启动

1. 确保 Vite 开发服务器正在运行（http://localhost:5173）
2. 检查端口 5173 是否被占用
3. 尝试手动运行：`yarn dev`，然后在另一个终端运行 `electron .`

## 📚 更多信息

详细配置说明请参考 `electron/README.md`

