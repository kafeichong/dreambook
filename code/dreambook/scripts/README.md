# Windows 构建脚本使用说明

## 📋 脚本文件

- `build-win.ps1` - Windows 专用构建脚本（自动禁用代码签名）
- `clear-electron-cache.ps1` - 清除 Electron Builder 缓存脚本

## 🚀 运行方法

### 方法 1：通过 npm 脚本运行（推荐，最简单）

这是最简单的方法，已经在 `package.json` 中配置好了：

```powershell
# 构建 Windows 安装程序
npm run electron:build:win

# 只构建目录（不创建安装程序，用于测试）
npm run electron:build:win:dir

# 跳过类型检查（更快）
npm run electron:build:win:skip-check
```

### 方法 2：直接运行 PowerShell 脚本

#### 步骤 1：打开 PowerShell

- 按 `Win + X`，然后选择 "Windows PowerShell" 或 "终端"
- 或者按 `Win + R`，输入 `powershell`，回车

#### 步骤 2：进入项目目录

```powershell
cd C:\code\dreambook
```

#### 步骤 3：运行脚本

```powershell
# 完整构建（安装程序）
.\scripts\build-win.ps1

# 只构建目录
.\scripts\build-win.ps1 -Dir

# 跳过类型检查
.\scripts\build-win.ps1 -SkipCheck

# 组合参数
.\scripts\build-win.ps1 -Dir -SkipCheck
```

### 方法 3：如果遇到执行策略错误

如果看到错误信息：
```
无法加载文件 xxx.ps1，因为在此系统上禁止运行脚本
```

需要修改 PowerShell 执行策略：

#### 方案 A：临时允许（仅当前会话）

```powershell
# 以管理员身份运行 PowerShell，然后执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

#### 方案 B：永久允许（推荐）

1. 右键点击 PowerShell，选择"以管理员身份运行"
2. 执行以下命令：
   ```powershell
   Set-ExecutionPolicy RemoteSigned
   ```
3. 输入 `Y` 确认

#### 方案 C：绕过执行策略运行（临时）

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

## 📝 脚本功能

`build-win.ps1` 脚本会自动执行以下操作：

1. ✅ 设置环境变量 `CSC_IDENTITY_AUTO_DISCOVERY=false` 禁用代码签名
2. ✅ 清除损坏的 winCodeSign 缓存
3. ✅ 执行 TypeScript 类型检查和构建
4. ✅ 使用 Vite 构建 Web 应用
5. ✅ 打包 Electron 应用

## ⚙️ 脚本参数

- `-Dir`: 只构建目录（`win-unpacked`），不创建安装程序
- `-SkipCheck`: 跳过 TypeScript 类型检查，加快构建速度

## 🔍 示例

```powershell
# 完整构建并生成安装程序
.\scripts\build-win.ps1

# 只构建目录，用于测试
.\scripts\build-win.ps1 -Dir

# 快速构建（跳过类型检查）
.\scripts\build-win.ps1 -SkipCheck

# 快速构建目录
.\scripts\build-win.ps1 -Dir -SkipCheck
```

## 💡 提示

- 推荐使用方法 1（通过 npm 脚本），最简单且不需要修改执行策略
- 如果遇到权限问题，可以启用 Windows 开发者模式（设置 > 更新和安全 > 针对开发人员）
- 构建完成后，文件会输出到 `release/` 目录

## 📚 相关文档

- [WINDOWS_BUILD.md](../WINDOWS_BUILD.md) - Windows 构建完整指南
- [WINDOWS_CODESIGN_FIX.md](../WINDOWS_CODESIGN_FIX.md) - 代码签名错误修复指南

