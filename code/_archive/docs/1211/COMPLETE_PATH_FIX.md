# 完整路径修复说明

## 问题描述

应用在 Electron 打包后出现多个资源加载错误：
1. 背景图片无法加载：`GET file:///assets/backgrounds/index_bg.webp net::ERR_FILE_NOT_FOUND`
2. 数据文件无法加载：`GET file:///data/dreamData.json net::ERR_FILE_NOT_FOUND`

这些错误是因为代码中使用了绝对路径（如 `/assets/...`），在 Electron 的 `file://` 协议下无法正确加载。

## ✅ 已修复的文件

### 1. 数据文件加载 (`src/hooks/useDreamData.ts`)
- ✅ 使用 `getAssetPath('/data/dreamData.json')` 替代绝对路径

### 2. 首页组件 (`src/pages/HomePage/HomePage.tsx`)
- ✅ Logo、Title、背景图路径已修复

### 3. 详情页组件 (`src/pages/DetailPage/DetailPage.tsx`)
- ✅ 加载状态和错误状态的背景图
- ✅ 所有梦境背景图（动态路径）
- ✅ 水波纹背景相关资源
- ✅ 所有背景组件使用的图片路径

### 4. 导航页组件 (`src/pages/NavigationPage/NavigationPage.tsx`)
- ✅ 加载状态和错误状态的背景图
- ✅ 默认背景图
- ✅ 梦境卡片图片路径

## 🔧 修复方法

所有路径都使用 `getAssetPath()` 工具函数处理：

```typescript
import { getAssetPath } from '@utils/assetPath'

// 之前（错误）
<img src="/assets/logo.png" />
fetch('/data/dreamData.json')

// 之后（正确）
<img src={getAssetPath('/assets/logo.png')} />
fetch(getAssetPath('/data/dreamData.json'))
```

## 📋 修复清单

### 数据文件
- [x] `useDreamData.ts` - 数据文件加载路径

### 首页
- [x] `HomePage.tsx` - Logo、Title、背景图

### 详情页
- [x] `DetailPage.tsx` - 所有背景图片路径
- [x] `DetailPage.tsx` - 水波纹相关资源

### 导航页
- [x] `NavigationPage.tsx` - 所有背景图片路径
- [x] `NavigationPage.tsx` - 梦境卡片图片

### 组件
- [x] `ParticleBackground.tsx` - 默认背景图处理
- [ ] 检查其他组件是否需要修复

## 🚀 重新构建步骤

```bash
cd code/dreambook

# 清理之前的构建
rm -rf dist dist-electron release

# 重新构建
yarn build

# 重新打包 Electron 应用
yarn electron:build
```

## ✅ 预期结果

修复后，应用应该能够：
- ✅ 正确加载所有背景图片
- ✅ 正确加载数据文件（dreamData.json）
- ✅ 所有页面正常显示
- ✅ 没有资源加载错误

## 🔍 验证方法

1. **打开应用**：
   ```bash
   open release/mac-arm64/梦境解析.app
   ```

2. **检查开发者工具**：
   - 打开开发者工具（Cmd+Option+I）
   - 查看 Console 标签页，应该没有 404 错误
   - 查看 Network 标签页，所有资源应该都成功加载（200 状态）

3. **测试各个页面**：
   - 首页：背景图、Logo、Title 都正常显示
   - 导航页：背景图和所有卡片图片正常显示
   - 详情页：背景图和所有资源正常显示

## 📝 注意事项

1. **工具函数**：`getAssetPath()` 会自动根据运行环境返回正确的路径：
   - Electron 环境（`file://`）：返回相对路径 `./assets/...`
   - 开发环境（`http://`）：返回绝对路径 `/assets/...`

2. **动态路径**：对于动态路径（如 `${dream.id}_bg.webp`），也需要使用 `getAssetPath()` 包装整个路径字符串。

3. **组件传参**：如果组件接收路径参数，建议在调用时使用 `getAssetPath()` 处理，而不是在组件内部处理。

## 🐛 如果仍有问题

如果重新构建后仍然有路径错误：

1. **检查构建输出**：
   ```bash
   ls -la dist/assets/
   ls -la dist/data/
   ```

2. **检查资源文件**：
   确保 `public/` 目录下的所有资源文件都正确复制到了 `dist/` 目录。

3. **查看具体错误**：
   打开开发者工具，查看 Network 标签页中失败的请求，确认具体的路径是什么。

