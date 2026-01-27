# Windows 构建 winCodeSign 错误修复指南

## 问题描述

构建 Windows 版本时遇到以下错误：
```
ERROR: Cannot create symbolic link : 客户端没有所需的特权
```

这是由于 electron-builder 尝试下载代码签名工具包时，包含 macOS 符号链接文件导致的权限问题。

## 🚀 快速解决方案

### ⭐ 方案 0：使用专用构建脚本（最简单，推荐）

项目已提供专用的 Windows 构建脚本，会自动禁用代码签名并清除缓存：

```powershell
# 构建 Windows 安装程序
npm run electron:build:win

# 或只构建目录（用于测试）
npm run electron:build:win:dir

# 或跳过类型检查（更快）
npm run electron:build:win:skip-check
```

这个脚本会自动：
- ✅ 设置环境变量禁用代码签名
- ✅ 清除损坏的 winCodeSign 缓存
- ✅ 执行构建和打包

### 方案 1：手动清除缓存

如果您想使用标准的构建命令，先清除缓存：

```powershell
# 运行提供的清除脚本
.\scripts\clear-electron-cache.ps1

# 然后重新构建
npm run electron:build
```

或者手动清除：
```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
npm run electron:build
```

### 方案 2：启用 Windows 开发者模式（一劳永逸）

1. 打开 Windows 设置（`Win + I`）
2. 导航到：`更新和安全` > `针对开发人员`（或 `隐私和安全性` > `针对开发人员`）
3. 启用 `开发者模式`
4. 重新运行构建命令

**优点**：一次设置，永久有效，无需每次清除缓存

### 方案 3：以管理员身份运行（临时方案）

右键点击 PowerShell，选择"以管理员身份运行"，然后执行：
```powershell
cd C:\code\dreambook
npm run electron:build
```

## 📝 配置说明

项目已在 `package.json` 中配置了 `"sign": null` 来禁用代码签名，这适用于内部使用的应用。如果问题仍然存在，说明缓存中有损坏的文件，需要清除缓存。

## ✅ 验证

清除缓存后，重新构建应该不会再有符号链接错误。构建完成后，检查 `release/` 目录中是否有生成的文件。

## 📚 更多信息

详细说明请参考 [WINDOWS_BUILD.md](./WINDOWS_BUILD.md) 中的"问题 5：winCodeSign 符号链接错误"部分。

