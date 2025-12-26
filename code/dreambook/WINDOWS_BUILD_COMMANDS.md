# Windows 构建命令（CMD 版本）

## 🚀 快速开始

### 方法 1：使用 CMD（命令提示符）

1. **打开 CMD**：
   - 按 `Win + R`
   - 输入 `cmd`
   - 按回车

2. **进入项目目录**（注意路径中有空格时使用引号）：

```cmd
cd "C:\Users\steven\works\20251130dreambook\code\dreambook"
```

或者如果已经在工作目录下：

```cmd
cd works\20251130dreambook\code\dreambook
```

3. **构建 Windows 安装程序**：

```cmd
yarn electron:build:win
```

或者分步执行：

```cmd
yarn build
yarn electron-builder --win
```

### 方法 2：使用 npx（如果 yarn 有问题）

```cmd
cd "C:\Users\steven\works\20251130dreambook\code\dreambook"
npm run build
npx electron-builder --win
```

## 📋 完整命令示例

### 示例 1：完整路径（推荐）

```cmd
cd "C:\Users\steven\works\20251130dreambook\code\dreambook"
yarn electron:build:win
```

### 示例 2：分步执行

```cmd
cd "C:\Users\steven\works\20251130dreambook\code\dreambook"
yarn build
electron-builder --win
```

### 示例 3：使用 npx

```cmd
cd "C:\Users\steven\works\20251130dreambook\code\dreambook"
npm run build
npx electron-builder --win
```

## 🔍 检查当前目录

如果不知道当前在哪个目录，可以：

```cmd
# 查看当前目录
cd

# 或者
echo %cd%

# 列出当前目录文件
dir

# 查看项目是否存在
dir "C:\Users\steven\works\20251130dreambook\code\dreambook"
```

## ⚠️ 常见问题

### 问题 1：路径中有空格

如果路径中包含空格，必须使用引号：

```cmd
# 错误
cd C:\Users\steven\works\20251130dreambook\code\dreambook

# 正确
cd "C:\Users\steven\works\20251130dreambook\code\dreambook"
```

### 问题 2：找不到文件

确保路径正确，可以使用以下方法：

1. **找到项目文件夹**：
   - 打开文件资源管理器
   - 导航到 `C:\Users\steven\works\20251130dreambook\code\dreambook`
   - 在地址栏中复制完整路径

2. **在文件资源管理器中打开 CMD**：
   - 在项目文件夹中，按住 `Shift` 键
   - 右键点击空白处
   - 选择"在此处打开 PowerShell 窗口"或"在此处打开命令窗口"
   - 这样就已经在正确的目录了

### 问题 3：确认路径

```cmd
# 检查目录是否存在
dir "C:\Users\steven\works\20251130dreambook\code\dreambook\package.json"

# 如果文件存在，说明路径正确
# 如果不存在，需要找到正确的路径
```

## 📝 完整的构建流程

```cmd
# 1. 打开 CMD（Win + R，输入 cmd）

# 2. 进入项目目录（根据实际路径调整）
cd "C:\Users\steven\works\20251130dreambook\code\dreambook"

# 3. 验证目录正确（应该能看到 package.json）
dir package.json

# 4. 构建应用
yarn build

# 5. 打包 Windows 安装程序
electron-builder --win

# 6. 检查输出（应该在 release 目录下）
dir release\*.exe
```

## 🎯 最简单的步骤

1. **打开文件资源管理器**
2. **导航到项目文件夹**：`C:\Users\steven\works\20251130dreambook\code\dreambook`
3. **在地址栏输入 `cmd` 并按回车**（这样会在当前文件夹打开 CMD）
4. **运行命令**：
   ```cmd
   yarn electron:build:win
   ```

或者直接在地址栏输入 `cmd` 后按回车！

