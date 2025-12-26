# Windows Yarn PnP TypeScript 问题修复

## 问题描述

在 Windows 上运行 `yarn build` 时出现错误：
```
Error: Cannot find module '../lib/tsc.js'
```

这是 Yarn PnP 与 TypeScript 的兼容性问题。

## ✅ 已修复

已修复 `tsconfig.app.json` 中的路径问题：
- 将 `tsBuildInfoFile` 从 `./node_modules/.tmp/...` 改为 `.tmp/...`

## 🔧 解决方案

### 方案 1：清理并重新安装依赖（推荐）✅

在 Windows CMD 中运行：

```cmd
cd C:\code\dreambook

# 1. 清理 Yarn 缓存
yarn cache clean

# 2. 删除 PnP 文件
del .pnp.cjs
rmdir /s /q .yarn\cache

# 3. 重新安装依赖
yarn install

# 4. 尝试构建
yarn build
```

### 方案 2：使用 npx 运行 TypeScript

如果直接运行 `yarn tsc` 有问题，可以尝试：

```cmd
npx tsc -b
```

### 方案 3：跳过 TypeScript 检查（临时方案）

如果急需构建，可以临时修改构建流程：

1. **修改 `package.json` 的构建脚本**：

```json
{
  "scripts": {
    "build": "vite build && tsx scripts/build-electron.ts",
    "build:check": "tsc -b && vite build && tsx scripts/build-electron.ts"
  }
}
```

然后运行：

```cmd
yarn build
yarn electron:build:win
```

这样会跳过 TypeScript 类型检查，但应用仍能正常构建和运行。

### 方案 4：使用 npm（如果 Yarn 持续有问题）

如果 Yarn PnP 问题持续，可以临时切换到 npm：

```cmd
cd C:\code\dreambook

# 删除 Yarn 相关文件
del .pnp.cjs
rmdir /s /q .yarn

# 使用 npm 安装
npm install

# 构建
npm run build
npm run electron:build:win
```

## 🚀 完整修复步骤

### 步骤 1：清理环境

```cmd
cd C:\code\dreambook

# 清理所有缓存和构建文件
rmdir /s /q dist
rmdir /s /q dist-electron
rmdir /s /q release
rmdir /s /q .yarn\cache
del .pnp.cjs
```

### 步骤 2：重新安装依赖

```cmd
yarn install
```

### 步骤 3：验证

```cmd
# 验证 TypeScript
yarn tsc --version

# 尝试构建
yarn build
```

## 💡 快速解决方案

**如果急需构建，最快的方法**：

1. **临时跳过 TypeScript 检查**：

   修改 `package.json`：

   ```json
   {
     "scripts": {
       "build": "vite build && tsx scripts/build-electron.ts"
     }
   }
   ```

2. **直接构建**：

   ```cmd
   yarn build
   yarn electron:build:win
   ```

   这样可以跳过类型检查，直接构建应用。

## 📝 注意事项

1. **跳过类型检查**：虽然可以跳过，但建议修复后重新启用类型检查
2. **Yarn PnP**：这是 Yarn PnP 在 Windows 上的已知兼容性问题
3. **推荐方案**：清理并重新安装依赖通常可以解决问题

## ✅ 推荐操作顺序

**立即尝试**：

```cmd
cd C:\code\dreambook

# 方法 1：清理并重装（推荐）
yarn cache clean
del .pnp.cjs
rmdir /s /q .yarn\cache
yarn install
yarn build

# 如果方法1失败，使用方法2：临时跳过类型检查
# 修改 package.json 的 build 脚本后：
yarn build
yarn electron:build:win

# 如果都失败，使用方法3：切换到 npm
del .pnp.cjs
rmdir /s /q .yarn
npm install
npm run build
npm run electron:build:win
```
