# Windows UNC 路径问题解决

## 问题描述

在 Windows 上访问 macOS 共享文件夹（如 `\\psf\` 或 `C:\Mac\`），CMD 提示：
```
UNC 路径不受支持。默认值设为 Windows 目录。
```

这是因为 Windows CMD 无法在 UNC 路径（网络共享路径）下直接执行命令。

## 🔧 解决方案

### 方案 1：将项目复制到 Windows 本地路径（推荐）✅

**步骤**：

1. **在 Windows 上创建本地目录**：
   ```cmd
   mkdir C:\projects
   ```

2. **复制项目文件夹到本地**：
   - 打开文件资源管理器
   - 导航到 `C:\Mac\Home\Desktop\code\`
   - 复制 `dreambook` 文件夹
   - 粘贴到 `C:\projects\`

3. **或者使用命令行复制**：
   ```cmd
   xcopy "C:\Mac\Home\Desktop\code\dreambook" "C:\projects\dreambook\" /E /I
   ```

4. **进入本地目录并构建**：
   ```cmd
   cd C:\projects\dreambook
   yarn install
   yarn electron:build:win
   ```

### 方案 2：使用 Git 同步代码（推荐）✅

如果您使用 Git，这是最佳方案：

1. **在 macOS 上提交代码**：
   ```bash
   cd /Users/steven/works/20251130dreambook/code/dreambook
   git add .
   git commit -m "Ready for Windows build"
   git push
   ```

2. **在 Windows 上克隆或拉取**：
   ```cmd
   cd C:\projects
   git clone <repository-url> dreambook
   cd dreambook
   yarn install
   yarn electron:build:win
   ```

或者如果已有仓库：
   ```cmd
   cd C:\projects\dreambook
   git pull
   yarn install
   yarn electron:build:win
   ```

### 方案 3：映射网络驱动器到本地盘符

将 UNC 路径映射到本地驱动器：

1. **打开文件资源管理器**
2. **右键点击"此电脑" → "映射网络驱动器"**
3. **设置**：
   - 驱动器：选择未使用的盘符（如 `Z:`）
   - 文件夹：`\\psf\Home\Desktop\code`
   - ✅ 勾选"登录时重新连接"
4. **点击"完成"**

然后可以使用映射的盘符：

```cmd
cd Z:\dreambook
yarn install
yarn electron:build:win
```

**注意**：即使映射到本地盘符，某些工具可能仍有问题，**方案 1 或 2 更可靠**。

### 方案 4：使用 PowerShell（可能可行）

PowerShell 对 UNC 路径支持更好，可以尝试：

```powershell
cd "\\psf\Home\Desktop\code\dreambook"
yarn install
yarn electron:build:win
```

但这种方式仍可能遇到权限或路径问题。

## 🎯 推荐工作流

### 最佳实践：使用 Git 同步

1. **在 macOS 上开发**：
   ```bash
   cd /Users/steven/works/20251130dreambook/code/dreambook
   # 开发代码...
   git add .
   git commit -m "Update"
   git push
   ```

2. **在 Windows 上构建**：
   ```cmd
   # 首次克隆
   cd C:\projects
   git clone <repository-url> dreambook
   cd dreambook
   yarn install
   yarn electron:build:win
   
   # 后续更新
   cd C:\projects\dreambook
   git pull
   yarn install
   yarn electron:build:win
   ```

## ⚠️ 注意事项

### UNC 路径的限制

- ❌ CMD 无法在 UNC 路径下运行
- ⚠️ 某些构建工具可能无法正常工作
- ⚠️ 文件权限可能有问题
- ⚠️ 性能可能较慢（通过网络）

### 本地路径的优势

- ✅ 性能更好（本地磁盘）
- ✅ 所有工具都能正常工作
- ✅ 文件权限正常
- ✅ 没有路径限制

## 📝 快速操作指南

### 如果您有 Git 仓库

**在 Windows 上**：

```cmd
# 1. 创建项目目录
mkdir C:\projects
cd C:\projects

# 2. 克隆仓库（如果是首次）
git clone <your-repo-url> dreambook

# 或者如果已有仓库，直接进入
cd dreambook

# 3. 安装依赖
yarn install

# 4. 构建 Windows 应用
yarn electron:build:win
```

### 如果没有 Git 仓库

**在 Windows 上**：

```cmd
# 1. 创建项目目录
mkdir C:\projects

# 2. 复制项目文件夹（使用文件资源管理器）
# 从：C:\Mac\Home\Desktop\code\dreambook
# 到：C:\projects\dreambook

# 3. 进入项目目录
cd C:\projects\dreambook

# 4. 安装依赖
yarn install

# 5. 构建 Windows 应用
yarn electron:build:win
```

## 🔍 验证路径

检查当前路径是否正确：

```cmd
# 查看当前目录
cd

# 应该显示本地路径，如：
# C:\projects\dreambook

# 不应该显示 UNC 路径，如：
# \\psf\Home\Desktop\code\dreambook
```

## ✅ 总结

**最简单可靠的方法**：

1. 将项目复制到 Windows 本地路径（如 `C:\projects\dreambook`）
2. 或者在本地路径使用 Git 克隆/拉取代码
3. 然后在本地路径运行构建命令

这样可以避免所有 UNC 路径相关的问题！

