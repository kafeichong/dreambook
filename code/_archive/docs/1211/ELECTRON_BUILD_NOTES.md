# Electron 构建说明

## 构建状态

✅ **应用已成功构建！**

应用文件位置：
- Intel 架构：`release/mac/梦境解析.app`
- Apple Silicon (M 系列)：`release/mac-arm64/梦境解析.app`

## 部署方式

### 直接使用 .app 文件（推荐）

对于触摸屏应用，`.app` 文件已经可以直接使用：

```bash
# 复制到应用程序文件夹（根据您的 Mac 架构选择）
# Apple Silicon (M 系列芯片)
cp -r release/mac-arm64/梦境解析.app /Applications/

# Intel 芯片
cp -r release/mac/梦境解析.app /Applications/

# 或者直接双击运行
open release/mac-arm64/梦境解析.app
```

### 手动创建 DMG（可选）

如果需要 DMG 安装包，可以手动创建：

```bash
# Apple Silicon 版本
hdiutil create -volname "梦境解析" \
  -srcfolder release/mac-arm64/梦境解析.app \
  -ov -format UDZO \
  release/梦境解析-arm64.dmg

# Intel 版本
hdiutil create -volname "梦境解析" \
  -srcfolder release/mac/梦境解析.app \
  -ov -format UDZO \
  release/梦境解析-x64.dmg
```

## 构建命令

- `yarn electron:build` - 构建 .app 文件（默认，推荐）✅
- `yarn electron:build:dir` - 构建 .app 文件（同上）
- `yarn electron:pack` - 构建 .app 文件（同上）

**注意**：默认配置已优化为只构建 `.app` 文件，避免 DMG 在 Yarn PnP 环境下的兼容性问题。如果需要 DMG，请使用上面的手动创建命令。

## 触摸屏部署

对于图书馆触摸屏设备，直接使用 `.app` 文件即可：
1. 将 `梦境解析.app` 复制到设备
2. 设置开机自启动（系统设置 → 用户与群组 → 登录项）
3. 应用会自动全屏启动

