# Windows PowerShell 执行策略问题解决

## 问题描述

在 Windows PowerShell 中运行 `yarn` 命令时出现错误：
```
无法加载文件 C:\Users\steven\AppData\Roaming\npm\yarn.ps1，因为在此系统上禁止运行脚本。
```

这是 Windows 系统的安全限制，PowerShell 默认不允许运行未签名的脚本。

## 🔧 解决方案

### 方案 1：使用 CMD 命令提示符（推荐）✅

**最简单的方法**：使用 Windows 命令提示符（CMD）而不是 PowerShell：

1. 按 `Win + R` 打开运行对话框
2. 输入 `cmd` 并按回车
3. 在 CMD 中运行：

```cmd
cd C:\Users\steven\works\20251130dreambook\code\dreambook
yarn electron:build:win
```

或者使用完整路径导航到项目目录。

### 方案 2：使用 npx 直接运行（推荐）✅

不使用 `yarn` 命令，直接使用 `npx`：

```powershell
# 进入项目目录
cd C:\Users\steven\works\20251130dreambook\code\dreambook

# 先构建
npm run build

# 然后使用 npx 运行 electron-builder
npx electron-builder --win
```

### 方案 3：修改 PowerShell 执行策略

如果您想继续使用 PowerShell，可以修改执行策略：

#### 步骤 1：以管理员身份运行 PowerShell

1. 按 `Win + X`
2. 选择"Windows PowerShell (管理员)"或"终端 (管理员)"

#### 步骤 2：查看当前执行策略

```powershell
Get-ExecutionPolicy
```

#### 步骤 3：修改执行策略（选择一种）

**选项 A：仅当前用户（推荐）**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**选项 B：仅当前会话（临时）**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

**选项 C：系统级别（需要管理员权限）**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

#### 步骤 4：验证修改

```powershell
Get-ExecutionPolicy
```

应该显示：`RemoteSigned` 或 `Bypass`

#### 步骤 5：运行命令

```powershell
cd C:\Users\steven\works\20251130dreambook\code\dreambook
yarn electron:build:win
```

### 方案 4：使用 Git Bash（如果已安装 Git）

如果您安装了 Git for Windows，可以使用 Git Bash：

1. 打开 Git Bash
2. 运行：

```bash
cd /c/Users/steven/works/20251130dreambook/code/dreambook
yarn electron:build:win
```

## 📋 执行策略说明

- **Restricted**（默认）：不允许运行任何脚本
- **RemoteSigned**（推荐）：可以运行本地脚本，远程脚本需要签名
- **Unrestricted**：允许运行所有脚本（不安全）
- **Bypass**：绕过所有策略（仅临时使用）

## ✅ 推荐方案

**对于您的需求，推荐使用方案 1（CMD）或方案 2（npx）**：

### 使用 CMD（最简单）

```cmd
cd C:\Users\steven\works\20251130dreambook\code\dreambook
yarn electron:build:win
```

### 使用 npx（无需修改系统设置）

```cmd
cd C:\Users\steven\works\20251130dreambook\code\dreambook
npm run build
npx electron-builder --win
```

## 🔍 验证

修改后，可以测试：

```powershell
# 测试 yarn 是否可用
yarn --version
```

如果显示版本号，说明问题已解决。

## ⚠️ 注意事项

1. **安全性**：修改执行策略会降低系统安全性，建议使用 `RemoteSigned` 而不是 `Unrestricted`
2. **管理员权限**：修改系统级别的执行策略需要管理员权限
3. **临时方案**：如果只是临时使用，建议使用方案 2（npx）或方案 1（CMD）

## 📝 快速参考

**最快的方法**：

```cmd
# 1. 打开 CMD（不是 PowerShell）
# 2. 运行以下命令

cd C:\Users\steven\works\20251130dreambook\code\dreambook
yarn electron:build:win
```

或者：

```cmd
cd C:\Users\steven\works\20251130dreambook\code\dreambook
npm run build
npx electron-builder --win
```

这两种方法都不需要修改系统设置！

