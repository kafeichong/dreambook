# Preload 脚本和路由修复说明

## 问题描述

应用启动时出现两个错误：

1. **Preload 脚本加载错误**：
   ```
   Error: require() of ES Module .../preload.js not supported.
   ```
   Electron 无法使用 `require()` 加载 ES 模块格式的 preload 脚本。

2. **路由错误**：
   ```
   No routes matched location "/Users/.../dist/index.html"
   ```
   React Router 将文件路径当作路由处理，导致路由不匹配。

## ✅ 已修复

### 1. Preload 脚本格式修复

**问题原因**：
- Preload 脚本通过 `require()` 加载，必须是 CommonJS 格式
- 之前错误地将 preload 脚本构建为 ES 模块格式

**修复方案**：
- 将 `scripts/build-electron.ts` 中 preload 脚本的构建格式从 `esm` 改为 `cjs`
- Main 进程脚本保持 `esm` 格式（因为 package.json 设置了 `"type": "module"`）

### 2. React Router 配置修复

**问题原因**：
- `BrowserRouter` 依赖浏览器的 History API，在 Electron 的 `file://` 协议下无法正常工作
- 文件路径被当作路由路径处理

**修复方案**：
- 将 `BrowserRouter` 改为 `HashRouter`
- HashRouter 使用 URL hash（`#`）来管理路由，在 Electron 中更稳定

**路由变化**：
- 之前：`/navigation` → `file:///path/to/index.html/navigation` ❌
- 现在：`/navigation` → `file:///path/to/index.html#/navigation` ✅

## 🔧 修改的文件

1. **`scripts/build-electron.ts`**
   - Preload 脚本构建格式改为 `cjs`

2. **`src/App.tsx`**
   - `BrowserRouter` 改为 `HashRouter`

## 📝 重新构建步骤

```bash
cd code/dreambook

# 清理之前的构建
rm -rf dist dist-electron release

# 重新构建
yarn build

# 重新打包 Electron 应用
yarn electron:build
```

## 🚀 预期结果

修复后，应用应该能够：
1. ✅ Preload 脚本正确加载，不再有 require() 错误
2. ✅ 路由正常工作，能够正确导航到各个页面
3. ✅ 所有功能正常，包括首页、导航页、详情页

## 注意事项

### HashRouter 的影响

使用 HashRouter 后，URL 会有 `#` 符号：
- 首页：`file:///.../index.html#/`
- 导航页：`file:///.../index.html#/navigation`
- 详情页：`file:///.../index.html#/dream/01`

这对于 Electron 应用是完全正常的，不会影响功能。

### 如果需要使用 BrowserRouter

如果将来需要使用 BrowserRouter（例如要支持直接访问 URL），需要：

1. 使用 `MemoryRouter` 或自定义路由解决方案
2. 或者通过 Electron 的协议处理器自定义协议（如 `app://`）

但对于触摸屏应用，HashRouter 已经足够，推荐使用。

