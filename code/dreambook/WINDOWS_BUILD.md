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

### 方法 2：在 macOS 上构建 Windows 目录版本（不创建安装程序）

如果您在 macOS 上，可以构建 Windows 应用的目录版本（unpacked），但**无法创建 NSIS 安装程序**，因为 NSIS 是 Windows 专用工具。

```bash
# 构建 Windows 目录版本（不创建安装程序）
yarn electron:build:win:dir
```

**输出文件位置**：
```
release/
└── win-unpacked/          # Windows 应用目录
    └── 梦境解析.exe        # 可执行文件
```

**注意**：
- ✅ 可以构建 Windows 应用的目录版本（`win-unpacked/`）
- ❌ **无法创建 NSIS 安装程序**（`.exe` 安装包），因为需要 Windows 系统
- 💡 如果需要安装程序，请在 Windows 系统上运行 `yarn electron:build:win`

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

3. **应用签名**：
   - 当前配置已禁用代码签名（`"sign": null`），适用于内部使用的应用
   - 如果需要代码签名，需要配置签名证书并移除 `"sign": null` 配置
   - 未签名的应用在 Windows 上运行可能会有安全提示，但不影响正常使用

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

### 问题 4：在 macOS 上构建 Windows 安装程序失败

**错误**：
```
⨯ spawn /Users/steven/Library/Caches/electron-builder/nsis/nsis-3.0.4.1/mac/makensis ENOENT
```

**原因**：NSIS（Nullsoft Scriptable Install System）是 Windows 专用工具，无法在 macOS 上运行。

**解决**：
1. **在 macOS 上只构建目录版本**（推荐）：
   ```bash
   yarn electron:build:win:dir
   ```
   这会生成 `release/win-unpacked/` 目录，包含可运行的 Windows 应用。

2. **在 Windows 系统上构建安装程序**（如果需要 .exe 安装包）：
   ```bash
   yarn electron:build:win
   ```

**注意**：`release/win-unpacked/` 目录中的 `梦境解析.exe` 可以直接运行，只是没有安装程序。

### 问题 5：winCodeSign 符号链接错误

**错误**：
```
ERROR: Cannot create symbolic link : 客户端没有所需的特权 : C:\Users\...\winCodeSign\...\darwin\10.12\lib\libcrypto.dylib
```

**原因**：electron-builder 尝试下载并解压 `winCodeSign` 工具用于代码签名，但该工具包中包含 macOS 的符号链接文件，在 Windows 上创建符号链接需要管理员权限。

**解决方案**（按推荐顺序）：

0. **使用专用构建脚本**（⭐ 最简单，推荐）：
   
   项目提供了专用的 Windows 构建脚本，会自动禁用代码签名并清除缓存：
   
   ```powershell
   # 直接运行，脚本会自动处理所有问题
   npm run electron:build:win
   
   # 或只构建目录
   npm run electron:build:win:dir
   ```
   
   这个脚本会自动：
   - 设置环境变量 `CSC_IDENTITY_AUTO_DISCOVERY=false` 禁用代码签名
   - 清除损坏的 winCodeSign 缓存
   - 执行构建和打包

1. **清除缓存并使用禁用签名的配置**：
   
   已在 `package.json` 的 `win` 配置中添加 `"sign": null` 来禁用代码签名。首先清除损坏的缓存：
   
   ```powershell
   # 方法 A：使用提供的脚本（推荐）
   .\scripts\clear-electron-cache.ps1
   
   # 方法 B：手动清除 winCodeSign 缓存
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
   
   # 方法 C：清除所有 electron-builder 缓存（如果上述方法无效）
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache"
   ```
   
   清除缓存后，重新构建：
   ```powershell
   npm run electron:build
   ```

2. **启用 Windows 开发者模式**（推荐，一次设置永久有效）：
   
   启用开发者模式后，可以在没有管理员权限的情况下创建符号链接：
   
   - 打开 Windows 设置（Win + I）
   - 导航到：`更新和安全` > `针对开发人员`（或 `隐私和安全性` > `针对开发人员`）
   - 启用 `开发者模式`
   - 重新运行构建命令
   
   这是最优雅的解决方案，因为它允许您正常使用所有功能，而无需每次都以管理员身份运行。

3. **以管理员身份运行**（临时方案）：
   
   右键点击 PowerShell 或命令提示符，选择"以管理员身份运行"，然后执行构建命令：
   ```powershell
   cd C:\code\dreambook
   npm run electron:build
   ```
   
   **注意**：这种方式每次都需要管理员权限，不太方便。

4. **使用环境变量禁用签名**：
   
   如果配置中的 `"sign": null` 不起作用，可以临时使用环境变量：
   ```powershell
   $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
   npm run electron:build
   ```

**注意**：
- 对于图书馆内部使用的触摸屏应用，禁用代码签名通常是可以接受的
- 未签名的应用在 Windows 上运行时可能会有安全提示，但不影响正常使用
- 如果仍然遇到问题，建议启用 Windows 开发者模式（方案 2），这是最彻底的解决方案

## 📚 参考资源

- [electron-builder Windows 文档](https://www.electron.build/configuration/win)
- [NSIS 安装程序配置](https://www.electron.build/configuration/nsis)

## ✅ 快速命令参考

```powershell
# ⭐ 推荐：使用专用构建脚本（自动禁用签名并清除缓存）
npm run electron:build:win              # 构建安装程序
npm run electron:build:win:dir          # 只构建目录
npm run electron:build:win:skip-check   # 跳过类型检查

# 清除 Electron Builder 缓存（解决 winCodeSign 错误）
.\scripts\clear-electron-cache.ps1

# 在 macOS 上构建 Windows 目录版本（不创建安装程序）
npm run electron:build:win:dir

# 如果遇到符号链接错误，使用专用脚本或先清除缓存再构建
.\scripts\clear-electron-cache.ps1
npm run electron:build
```

**提示**：专用的 Windows 构建脚本（`scripts/build-win.ps1`）会自动处理代码签名禁用和缓存清除，推荐优先使用。

