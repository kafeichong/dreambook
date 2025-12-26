# Electron 应用图标配置说明

## 📍 图标位置

**当前配置**: `public/logo.png`

图标文件路径已统一配置为 `public/logo.png`，适用于所有平台（macOS、Windows、Linux）。

✅ **图标文件已确认**：
- 文件路径：`public/logo.png`
- 尺寸：**1024x1024 像素**（完美！）
- 文件大小：571KB

## 📐 图标尺寸要求

### 推荐规格

- **尺寸**: `1024x1024` 像素（推荐）或最小 `512x512` 像素
- **格式**: PNG（支持透明背景）
- **颜色模式**: RGBA
- **文件大小**: 建议 < 500KB

### 为什么是 1024x1024？

electron-builder 会自动从这个单一 PNG 文件生成各平台所需的所有尺寸：
- macOS: 自动生成 `.icns` 文件（包含 16x16 到 1024x1024 的所有尺寸）
- Windows: 自动生成 `.ico` 文件（包含 16x16、32x32、48x48、256x256）
- Linux: 使用原始 PNG 或生成所需尺寸

## ✅ 检查当前图标

检查图标文件是否存在并查看尺寸：

```bash
# 检查文件是否存在
ls -lh public/logo.png

# 查看图片尺寸（macOS）
sips -g pixelWidth -g pixelHeight public/logo.png

# 或使用 ImageMagick
identify public/logo.png
```

## 🎨 图标设计建议

1. **简洁明了** - 在小尺寸下也能清晰识别
2. **高对比度** - 使用鲜明的颜色对比
3. **避免细节** - 在 16x16 尺寸下仍能识别
4. **保持比例** - 确保是正方形（1:1 比例）
5. **透明背景** - 使用透明背景或纯色背景

## 🔧 如何更新图标

### 方法 1：替换现有文件

直接替换 `public/logo.png` 文件：
- 保持文件名不变
- 确保是 PNG 格式
- 推荐尺寸 1024x1024

### 方法 2：使用新的图标文件

1. 将新图标放到 `public/logo.png`（替换现有文件）
2. 或放到 `build/icon.png`
3. 更新 `package.json` 中的图标路径

## 📝 配置文件

图标配置在 `package.json` 的 `build` 字段中：

```json
{
  "build": {
    "win": {
      "icon": "public/logo.png"
    },
    "mac": {
      "icon": "public/logo.png"
    },
    "linux": {
      "icon": "public/logo.png"
    }
  }
}
```

## ⚠️ 注意事项

1. **路径是相对于项目根目录的**
2. **如果图标文件不存在，electron-builder 会使用默认的 Electron 图标**
3. **图标文件会被打包到应用中，注意文件大小**
4. **构建后图标才会生效，开发模式下可能看不到自定义图标**

## 🚀 测试图标

构建应用后检查图标是否正确：

```bash
# 构建应用
yarn electron:build

# macOS: 查看 .app 文件的图标
open release/mac-arm64/梦境解析.app/Contents/Resources/

# Windows: 查看 .exe 文件的图标属性
# Linux: 查看 AppImage 的图标
```

## 📚 参考

- [electron-builder 图标文档](https://www.electron.build/icons)
- [Apple 应用图标设计指南](https://developer.apple.com/design/human-interface-guidelines/app-icons)
