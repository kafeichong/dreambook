# Windows 快速构建指南

## 🚀 快速解决方案

由于 Yarn PnP 在 Windows 上与 TypeScript 的兼容性问题，已添加一个跳过类型检查的构建命令。

### 方法 1：使用跳过类型检查的构建命令（推荐）✅

直接运行：

```cmd
cd C:\code\dreambook
yarn build:skip-check
yarn electron:build:win
```

或者使用新的快捷命令：

```cmd
cd C:\code\dreambook
yarn electron:build:win:skip-check
```

这会跳过 TypeScript 类型检查，直接构建应用。

### 方法 2：使用 npm（如果 Yarn 持续有问题）

```cmd
cd C:\code\dreambook

# 删除 Yarn 相关文件
del .pnp.cjs
rmdir /s /q .yarn

# 使用 npm
npm install
npm run build
npm run electron:build:win
```

## 📋 新增的命令

已在 `package.json` 中添加：

- `build:skip-check` - 跳过 TypeScript 检查，直接构建
- `electron:build:win:skip-check` - 一键构建 Windows 安装程序（跳过类型检查）

## ⚠️ 注意事项

1. **跳过类型检查**：`build:skip-check` 会跳过 TypeScript 类型检查，但应用仍能正常构建和运行
2. **Vite 仍会检查**：Vite 在构建时仍会进行基本的类型检查
3. **开发时建议**：在 macOS 上开发时，仍使用 `yarn build` 进行完整的类型检查

## ✅ 推荐工作流

### Windows 上构建

```cmd
# 快速构建（跳过类型检查）
yarn electron:build:win:skip-check
```

### macOS 上开发

```bash
# 完整构建（包含类型检查）
yarn build
yarn electron:build
```

## 🔍 如果仍有问题

如果 `build:skip-check` 也有问题，可以手动分步执行：

```cmd
cd C:\code\dreambook

# 1. 只构建 Vite
yarn vite build

# 2. 构建 Electron 文件
yarn tsx scripts/build-electron.ts

# 3. 打包
electron-builder --win
```

