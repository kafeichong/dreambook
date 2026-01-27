# Preload 脚本 .cjs 扩展名修复

## 问题描述

即使将 preload 脚本构建为 CommonJS 格式，但由于 `package.json` 中有 `"type": "module"`，所有 `.js` 文件都被视为 ES 模块，导致 Electron 无法使用 `require()` 加载 preload 脚本。

错误信息：
```
Error: require() of ES Module .../preload.js not supported.
preload.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module"
```

## ✅ 解决方案

使用 `.cjs` 扩展名，明确表示该文件是 CommonJS 格式，不受 `package.json` 的 `"type": "module"` 影响。

### 修改内容

1. **构建脚本** (`scripts/build-electron.ts`)
   - 将 preload 输出文件名从 `preload.js` 改为 `preload.cjs`

2. **主进程文件** (`electron/main.ts`)
   - 更新 preload 路径引用，从 `preload.js` 改为 `preload.cjs`

## 🔧 修改的文件

### 1. `scripts/build-electron.ts`

```typescript
outfile: join(outputDir, 'preload.cjs'), // 使用 .cjs 扩展名
```

### 2. `electron/main.ts`

```typescript
const preloadPath = isDev
  ? join(__dirname, 'preload.cjs')
  : join(app.getAppPath(), 'dist-electron', 'preload.cjs')
```

## 📝 为什么使用 .cjs 扩展名？

1. **明确文件类型**：`.cjs` 扩展名明确表示这是一个 CommonJS 文件
2. **不受 package.json 影响**：即使 `package.json` 中有 `"type": "module"`，`.cjs` 文件也会被当作 CommonJS
3. **Electron 兼容**：Electron 的 `require()` 可以正常加载 `.cjs` 文件
4. **标准做法**：这是 Node.js 和 Electron 社区推荐的做法

## 🚀 重新构建步骤

```bash
cd code/dreambook

# 清理之前的构建
rm -rf dist-electron release

# 重新构建（这会生成 preload.cjs）
yarn build

# 重新打包 Electron 应用
yarn electron:build
```

## ✅ 验证修复

构建后应该能看到：
- `dist-electron/preload.cjs` 文件存在
- 应用启动时不再有 preload 加载错误
- 开发者工具中没有 require() 相关的错误

## 📚 相关文件扩展名说明

- **`.js`** - 如果 `package.json` 有 `"type": "module"`，会被当作 ES 模块
- **`.cjs`** - 始终被视为 CommonJS，不受 `package.json` 影响
- **`.mjs`** - 始终被视为 ES 模块，不受 `package.json` 影响

对于 Electron 的 preload 脚本，必须使用 `.cjs` 或确保 `package.json` 没有 `"type": "module"`。

由于我们的项目需要 `"type": "module"` 来支持主进程的 ES 模块，所以使用 `.cjs` 是最佳解决方案。

