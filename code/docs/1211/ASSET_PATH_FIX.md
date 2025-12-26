# 资源路径修复说明

## 问题描述

应用在 Electron 打包后，只显示蓝色背景，看不到首页动画和内容。原因是代码中使用了绝对路径（如 `/assets/...`），在 Electron 的 `file://` 协议下无法正确加载资源。

## ✅ 已修复

### 1. 创建了资源路径工具函数

创建了 `src/utils/assetPath.ts` 工具函数，能够根据运行环境自动返回正确的路径：
- **Electron 打包环境**（`file://` 协议）：返回相对路径 `./assets/...`
- **开发环境**（`http://` 协议）：返回绝对路径 `/assets/...`

### 2. 更新了首页组件

修改了 `src/pages/HomePage/HomePage.tsx`：
- Logo 图片路径：使用 `getAssetPath('/assets/logo.png')`
- Title 图片路径：使用 `getAssetPath('/assets/title.png')`
- 背景图路径：使用 `getAssetPath('/assets/backgrounds/index_bg.webp')`

### 3. 更新了 ParticleBackground 组件

修改了 `src/components/ParticleBackground/ParticleBackground.tsx`：
- 支持传入已经处理过的路径
- 如果没有传入路径，自动使用默认路径并处理

## 🔧 如何测试修复

### 步骤 1：重新构建应用

```bash
cd code/dreambook

# 清理之前的构建
rm -rf dist dist-electron release

# 重新构建
yarn build

# 重新打包 Electron 应用
yarn electron:build
```

### 步骤 2：运行应用

```bash
# macOS
open release/mac-arm64/梦境解析.app

# 或从终端运行查看日志
./release/mac-arm64/梦境解析.app/Contents/MacOS/梦境解析
```

### 步骤 3：检查效果

应用应该能够正常显示：
- ✅ 背景图片（index_bg.webp）
- ✅ Logo 图片
- ✅ Title 图片
- ✅ 首页动画（粒子效果）
- ✅ 文字内容

如果仍然有问题，可以打开开发者工具查看错误：
- 应用加载后会自动打开开发者工具（已临时启用）
- 或按 `Cmd+Option+I` (macOS) 打开

## 📝 其他使用绝对路径的地方

如果其他页面或组件也使用了绝对路径，需要同样修复：

1. 导入工具函数：
```typescript
import { getAssetPath } from '@utils/assetPath'
```

2. 使用工具函数处理路径：
```typescript
// 之前
<img src="/assets/image.png" />

// 之后
<img src={getAssetPath('/assets/image.png')} />
```

## 🔍 检查清单

- [x] 创建 `getAssetPath` 工具函数
- [x] 更新 HomePage 组件使用工具函数
- [x] 更新 ParticleBackground 组件使用工具函数
- [ ] 检查其他组件是否也需要修复
- [ ] 重新构建并测试

## 🚀 预期结果

修复后，应用应该能够：
1. ✅ 正确加载所有资源文件（图片、背景图等）
2. ✅ 正常显示首页动画和内容
3. ✅ 所有元素都能正常显示，不再只有蓝色背景

## 需要帮助？

如果问题仍然存在，请检查：
1. 开发者工具中的错误信息（Network 标签页查看资源加载情况）
2. 控制台输出是否有路径相关错误
3. 资源文件是否都正确打包到 `dist/` 目录

