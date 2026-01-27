# Electron 构建命令说明

## 📋 当前命令配置

查看 `package.json` 中的脚本配置：

```json
{
  "scripts": {
    "electron:build": "yarn build && electron-builder --dir",
    "electron:build:dir": "yarn build && electron-builder --dir",
    "electron:pack": "yarn build && electron-builder --dir",
    "electron:dmg": "yarn build && electron-builder --mac --x64 --arm64"
  }
}
```

## 🔍 命令区别说明

### 当前状态（配置相同）

**目前这三个命令完全相同**：
- `yarn electron:build` 
- `yarn electron:build:dir`
- `yarn electron:pack`

它们都使用 `electron-builder --dir` 参数，表示：
- ✅ 构建应用的可执行文件目录
- ❌ **不生成安装包**（如 DMG、NSIS 等）
- 📁 输出到 `release/` 目录，直接是 `.app` 文件夹

### 设计意图的区别

虽然当前配置相同，但它们的**原始设计意图**不同：

#### 1. `electron:build` / `electron:build:dir`
- **用途**: 快速构建，用于开发和测试
- **输出**: 只生成可执行文件目录（`.app` 文件夹）
- **优势**: 构建速度快，不需要生成安装包
- **适用场景**: 
  - 本地测试
  - 开发调试
  - 快速验证构建是否成功

#### 2. `electron:pack` (原始设计)
- **用途**: 生成完整的分发包
- **输出**: 生成安装包（如 DMG、NSIS、AppImage）
- **优势**: 可以分发给用户安装
- **适用场景**: 
  - 准备发布版本
  - 需要安装包格式
  - 分发给最终用户

## ⚙️ electron-builder 参数说明

### `--dir` 参数
```bash
electron-builder --dir
```
- 只构建应用目录，不打包
- 输出: `release/mac-arm64/梦境解析.app`（文件夹）
- 速度快，适合测试

### 不带 `--dir` 参数
```bash
electron-builder
```
- 根据 `package.json` 中的 `build` 配置生成安装包
- macOS: DMG 文件
- Windows: NSIS 安装程序
- Linux: AppImage
- 速度较慢，但适合分发

## 💡 推荐配置

### 当前配置（已优化）

由于之前 DMG 构建在 Yarn PnP 环境下有问题，所以暂时都使用 `--dir` 模式：

```json
{
  "electron:build": "yarn build && electron-builder --dir",
  "electron:pack": "yarn build && electron-builder --dir"
}
```

### 优化后的配置建议

如果需要区分用途，可以这样配置：

```json
{
  "scripts": {
    // 快速构建（测试用）- 只生成 .app 文件夹
    "electron:build": "yarn build && electron-builder --dir",
    "electron:build:dir": "yarn build && electron-builder --dir",
    
    // 完整打包（发布用）- 生成安装包（如果 DMG 问题解决后）
    "electron:pack": "yarn build && electron-builder",
    
    // 明确只生成目录
    "electron:dir": "yarn build && electron-builder --dir"
  }
}
```

## 🎯 使用建议

### 对于触摸屏应用

**推荐使用 `electron:build`**，因为：
- ✅ 直接使用 `.app` 文件即可，不需要安装包
- ✅ 构建速度快
- ✅ 适合快速测试和部署
- ✅ 可以直接复制到 `/Applications` 或设备上运行

### 什么时候需要 `electron:pack`？

只有在需要以下情况时才需要安装包：
- 📦 分发给其他用户安装
- 🔒 需要安装向导流程
- 📝 需要自动创建快捷方式
- 🎁 需要 DMG 格式方便分发

## 📦 输出文件对比

### `electron:build` (当前配置)
```
release/
└── mac-arm64/
    └── 梦境解析.app/    # 可执行应用文件夹
        ├── Contents/
        └── ...
```

### `electron:pack` (原始设计，当前未启用)
```
release/
├── 梦境解析-0.0.0-arm64.dmg   # DMG 安装包
└── 梦境解析-0.0.0.dmg         # Intel 版本 DMG
```

## 🔄 当前状态总结

| 命令 | 当前配置 | 实际效果 | 推荐用途 |
|------|---------|---------|---------|
| `electron:build` | `--dir` | 生成 `.app` 文件夹 | ✅ 日常开发和测试 |
| `electron:build:dir` | `--dir` | 生成 `.app` 文件夹 | ✅ 明确表示目录模式 |
| `electron:pack` | `--dir` | 生成 `.app` 文件夹 | ⚠️ 命名有误导，建议改为 `electron:dir` |

## ✅ 结论

**当前这两个命令完全相同**，都生成 `.app` 文件夹。对于触摸屏应用，这已经足够了。如果需要安装包，可以使用文档中的手动创建 DMG 的方法。

建议：
- 日常使用：`yarn electron:build`
- 三个命令任选其一，效果相同

