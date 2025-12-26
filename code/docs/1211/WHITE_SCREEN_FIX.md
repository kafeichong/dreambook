# 白屏问题修复指南

## 问题原因

Electron 应用打包后出现白屏，通常是因为：
1. **资源路径问题** - Vite 构建时使用绝对路径，在 Electron 的 `file://` 协议下无法正确加载
2. **路径配置错误** - 打包后的文件路径与开发环境不同

## ✅ 已修复的问题

### 1. Vite 配置已更新

已在 `vite.config.ts` 中添加 `base: './'` 配置，使用相对路径：
```typescript
export default defineConfig({
  base: './', // 使用相对路径，适配 Electron 的 file:// 协议
  // ...
})
```

### 2. 错误处理已添加

已添加错误监听，可以在控制台查看详细错误信息。

## 🔧 修复步骤

### 步骤 1：重新构建应用

由于修改了 Vite 配置，需要重新构建：

```bash
# 清理之前的构建
rm -rf dist dist-electron release

# 重新构建
yarn build

# 重新打包 Electron 应用
yarn electron:build
```

### 步骤 2：检查构建输出

确认 `dist/index.html` 中的资源路径是相对路径：

```bash
# 检查 index.html 中的路径
cat dist/index.html | grep -E "src=|href="
```

应该看到类似 `./assets/...` 这样的相对路径，而不是 `/assets/...`。

### 步骤 3：调试白屏问题

如果仍然白屏，可以临时启用开发者工具查看错误：

1. **方法 1：修改代码临时打开开发者工具**

   在 `electron/main.ts` 的 `did-finish-load` 事件中，取消注释：
   ```typescript
   mainWindow.webContents.on('did-finish-load', () => {
     console.log('Page finished loading')
     // 临时打开开发者工具查看错误
     mainWindow?.webContents.openDevTools()
   })
   ```

2. **方法 2：通过快捷键**

   运行应用后，按 `Cmd+Option+I` (macOS) 或 `Ctrl+Shift+I` (Windows/Linux) 打开开发者工具。

3. **方法 3：查看控制台输出**

   从终端运行应用查看控制台错误：
   ```bash
   # macOS
   ./release/mac-arm64/梦境解析.app/Contents/MacOS/梦境解析
   ```

### 步骤 4：常见错误及解决方案

#### 错误 1：资源文件找不到 (404)

**症状**：控制台显示 404 错误，找不到 JS/CSS 文件

**解决**：
- 确认 `vite.config.ts` 中有 `base: './'`
- 检查 `dist/index.html` 中的路径是否为相对路径
- 确认 `package.json` 的 `files` 配置包含了 `dist/**/*`

#### 错误 2：路径解析失败

**症状**：控制台显示路径相关错误

**解决**：
- 检查 `electron/main.ts` 中的路径是否正确
- 确认打包后的文件结构：
  ```
  app.asar/
    ├── dist/
    │   ├── index.html
    │   └── assets/
    └── dist-electron/
        ├── main.js
        └── preload.js
  ```

#### 错误 3：JavaScript 错误

**症状**：控制台显示运行时错误

**解决**：
- 查看具体的错误信息
- 检查是否有依赖缺失
- 确认所有资源文件都已正确打包

## 🔍 验证修复

1. **重新构建并运行**：
   ```bash
   yarn build
   yarn electron:build
   open release/mac-arm64/梦境解析.app
   ```

2. **检查开发者工具**：
   - 打开开发者工具
   - 查看 Console 标签页是否有错误
   - 查看 Network 标签页确认资源是否加载成功

3. **如果仍然白屏**：
   - 复制开发者工具中的错误信息
   - 检查控制台输出
   - 查看网络请求是否都成功

## 📝 临时调试技巧

在 `electron/main.ts` 中，可以临时添加更多调试信息：

```typescript
// 在 createWindow 函数开始处添加
console.log('=== Debug Info ===')
console.log('isDev:', isDev)
console.log('app.getAppPath():', app.getAppPath())
console.log('__dirname:', __dirname)
console.log('==================')
```

## 🚀 预期结果

修复后，应用应该能够：
1. ✅ 正常启动并显示界面
2. ✅ 所有资源文件正确加载
3. ✅ 没有控制台错误
4. ✅ 应用功能正常

## 需要帮助？

如果问题仍然存在，请提供：
1. 开发者工具中的错误信息
2. 终端控制台的输出
3. 打包后的文件结构

