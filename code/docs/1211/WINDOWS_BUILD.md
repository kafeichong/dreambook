# Windows .exe 打包指南

## 📋 当前配置

项目的 `package.json` 中已配置 Windows 构建：

```json
{
  "build": {
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "public/logo.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## 🚀 打包 Windows .exe 文件

### 方法 1：在 Windows 系统上构建（推荐）

如果您有 Windows 系统或 Windows 虚拟机：

```bash
# 1. 清理之前的构建
rm -rf dist dist-electron release

# 2. 构建 Web 资源和 Electron 文件
yarn build

# 3. 打包 Windows 安装程序
yarn build && electron-builder --win

# 或者直接运行（会自动先构建）
npx electron-builder --win
```

**输出文件位置**：
```
release/
└── 梦境解析 Setup 0.0.0.exe    # NSIS 安装程序
```

### 方法 2：在 macOS 上交叉编译（需要配置）

如果您在 macOS 上，可以尝试交叉编译 Windows 版本，但需要额外配置：

```bash
# 安装 Windows 构建工具（可选，用于签名）
# 注意：交叉编译 Windows 应用可能有问题，建议在 Windows 系统上构建
```

**注意**：交叉编译 Windows 应用可能遇到问题，建议在 Windows 系统上直接构建。

## 📦 添加专用的 Windows 构建命令

建议在 `package.json` 的 `scripts` 中添加 Windows 专用命令：

```json
{
  "scripts": {
    "electron:build": "yarn build && electron-builder --dir",
    "electron:build:win": "yarn build && electron-builder --win",
    "electron:build:mac": "yarn build && electron-builder --mac",
    "electron:pack": "yarn build && electron-builder"
  }
}
```

## ⚙️ 配置说明

### Windows 目标配置

当前配置为 **NSIS 安装程序**：

- **target**: `nsis` - 生成 Windows 安装程序（.exe）
- **arch**: `x64` - 64 位架构
- **oneClick**: `false` - 显示安装向导（用户可以选择安装目录）
- **allowToChangeInstallationDirectory**: `true` - 允许用户选择安装目录
- **createDesktopShortcut**: `true` - 自动创建桌面快捷方式
- **createStartMenuShortcut**: `true` - 自动创建开始菜单快捷方式

### 其他 Windows 目标选项

如果需要其他格式，可以修改配置：

```json
{
  "win": {
    "target": [
      {
        "target": "portable",  // 便携版（.exe，无需安装）
        "arch": ["x64"]
      },
      // 或
      {
        "target": "nsis",      // 安装程序（默认）
        "arch": ["x64"]
      },
      // 或
      {
        "target": "zip",       // ZIP 压缩包
        "arch": ["x64"]
      }
    ]
  }
}
```

## 🎯 构建步骤详解

### 步骤 1：准备资源

确保所有资源文件都在正确的位置：

```bash
# 检查图标文件
ls -la public/logo.png

# 检查构建输出
ls -la dist/
ls -la dist-electron/
```

### 步骤 2：构建应用

```bash
# 构建所有资源
yarn build
```

这会生成：
- `dist/` - Web 应用资源
- `dist-electron/` - Electron 主进程和预加载脚本

### 步骤 3：打包 Windows 安装程序

```bash
# 在 Windows 系统上运行
electron-builder --win
```

或使用 yarn：

```bash
yarn build && electron-builder --win
```

### 步骤 4：检查输出

构建完成后，检查 `release/` 目录：

```bash
ls -la release/
```

应该能看到：
- `梦境解析 Setup 0.0.0.exe` - Windows 安装程序

## 📝 完整构建流程

```bash
# 1. 进入项目目录
cd code/dreambook

# 2. 清理之前的构建
rm -rf dist dist-electron release

# 3. 构建 Web 应用和 Electron 文件
yarn build

# 4. 打包 Windows 安装程序
electron-builder --win

# 5. 检查输出
ls -lh release/*.exe
```

## 🔧 构建选项

### 仅构建 64 位版本

```bash
electron-builder --win --x64
```

### 构建便携版（无需安装）

修改 `package.json` 中的配置：

```json
{
  "win": {
    "target": [
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ]
  }
}
```

然后运行：

```bash
electron-builder --win
```

输出：`release/梦境解析 0.0.0.exe`（便携版，直接运行）

## ⚠️ 注意事项

1. **系统要求**：
   - 构建 Windows 应用最好在 Windows 系统上进行
   - 在 macOS 上交叉编译可能有问题

2. **图标文件**：
   - 确保 `public/logo.png` 存在
   - Windows 需要 `.ico` 格式，但 electron-builder 会自动从 PNG 生成

3. **应用签名**（可选）：
   - 如果需要代码签名，需要配置签名证书
   - 未签名的应用在 Windows 上运行会有安全提示

4. **文件大小**：
   - 首次构建需要下载 Electron 二进制文件（约 100MB+）
   - 最终的 .exe 安装程序通常为 150-200MB

## 🐛 常见问题

### 问题 1：构建失败

**错误**：找不到 electron-builder 或权限错误

**解决**：
```bash
# 确保已安装依赖
yarn install

# 确保 electron-builder 已安装
yarn list electron-builder
```

### 问题 2：图标问题

**错误**：图标文件找不到或格式错误

**解决**：
- 确保 `public/logo.png` 存在
- 图标最好是 256x256 或 512x512 像素

### 问题 3：路径问题

**错误**：打包后应用无法加载资源

**解决**：
- 确保所有资源路径已使用 `getAssetPath()` 处理
- 检查 `dist/` 目录是否包含所有资源文件

## 📚 参考资源

- [electron-builder Windows 文档](https://www.electron.build/configuration/win)
- [NSIS 安装程序配置](https://www.electron.build/configuration/nsis)

## ✅ 快速命令参考

```bash
# 在 Windows 系统上构建 .exe 安装程序
yarn build && electron-builder --win

# 构建便携版（修改配置后）
yarn build && electron-builder --win

# 仅构建目录（用于测试）
yarn build && electron-builder --win --dir
```

