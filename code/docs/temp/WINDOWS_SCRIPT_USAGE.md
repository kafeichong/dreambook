# Windows 构建脚本运行指南

## 🚀 方法 1：通过 npm 运行（最简单，推荐）

这是最简单的方法，直接运行：

```powershell
# 进入项目目录
cd C:\code\dreambook

# 运行构建命令
npm run electron:build:win
```

可用的命令：
- `npm run electron:build:win` - 构建安装程序
- `npm run electron:build:win:dir` - 只构建目录
- `npm run electron:build:win:skip-check` - 跳过类型检查

## 📝 方法 2：直接运行 PowerShell 脚本

### 步骤 1：打开 PowerShell

- 按 `Win + X`，选择 "Windows PowerShell" 或 "终端"
- 或者按 `Win + R`，输入 `powershell`，回车

### 步骤 2：进入项目目录

```powershell
cd C:\code\dreambook
```

### 步骤 3：运行脚本

```powershell
# 完整构建（生成安装程序）
.\scripts\build-win.ps1

# 只构建目录（不生成安装程序）
.\scripts\build-win.ps1 -Dir

# 跳过类型检查
.\scripts\build-win.ps1 -SkipCheck

# 组合使用
.\scripts\build-win.ps1 -Dir -SkipCheck
```

## ⚠️ 如果遇到执行策略错误

如果看到错误：
```
无法加载文件 ...\build-win.ps1，因为在此系统上禁止运行脚本
```

### 解决方案 A：临时允许（推荐）

```powershell
# 以管理员身份运行 PowerShell，然后执行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

### 解决方案 B：永久允许

1. 右键点击 PowerShell，选择"以管理员身份运行"
2. 执行：
   ```powershell
   Set-ExecutionPolicy RemoteSigned
   ```
3. 输入 `Y` 确认

### 解决方案 C：绕过执行策略（临时）

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-win.ps1
```

## 💡 推荐做法

**最简单的方法就是使用方法 1**：

```powershell
npm run electron:build:win
```

这个命令已经配置好了，会自动绕过执行策略，无需额外设置。

## 📚 更多信息

- 脚本会自动禁用代码签名并清除缓存
- 构建完成后，文件会输出到 `release/` 目录
- 详细说明请查看 [scripts/README.md](./scripts/README.md)

