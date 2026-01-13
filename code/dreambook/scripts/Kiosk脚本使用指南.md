# DreamBook Kiosk 脚本使用指南

## 📦 脚本文件清单

### 修复工具（解决闪屏问题）
- **`fix-shell-config.bat`** - Shell 配置修复脚本
- **`run-fix-as-admin.bat`** - 自动请求管理员权限的启动器
- **`闪屏问题修复指南.md`** - 详细修复指南

### Kiosk 配置工具
- **`setup-kiosk.bat`** - Kiosk 模式配置脚本（原版）
- **`cleanup-kiosk-v2.bat`** - Kiosk 配置清理脚本（改进版 v2.0）⭐
- **`run-cleanup-v2-as-admin.bat`** - 清理脚本启动器
- **`verify-kiosk-v2.bat`** - 配置验证脚本 v2.0

---

## 🚨 紧急修复：闪屏问题

### 症状
运行 `cleanup-kiosk.bat` 后，Windows 启动时闪屏（黑屏一闪而过），无法进入桌面。

### 原因
旧版清理脚本只清理了 Default User 的 Shell 配置，但没有清理当前用户的 Shell 配置。

### 快速修复

1. **双击运行：**
   ```
   run-fix-as-admin.bat
   ```

2. **在 UAC 对话框中点击"是"**

3. **等待修复完成**，看到"修复完成！"

4. **重启电脑**

5. **正常登录** - 不会再闪屏

详细说明请查看：`闪屏问题修复指南.md`

---

## 📖 脚本功能说明

### 1. 修复工具

#### `fix-shell-config.bat`
**功能：** 修复 Shell 配置导致的闪屏问题

**做什么：**
- 清理当前用户的 Shell 配置
- 清理 Default User 的 Shell 配置
- 清理 kiosk 用户的 Shell 配置
- 验证系统 Shell 是否恢复正常

**适用场景：**
- 运行旧版清理脚本后出现闪屏
- Windows 启动后无法进入桌面
- 登录时只看到黑屏或应用闪现

**使用方法：**
```batch
# 方法1: 使用启动器（推荐）
双击 run-fix-as-admin.bat

# 方法2: 手动以管理员身份运行
右键 fix-shell-config.bat > 以管理员身份运行
```

---

### 2. Kiosk 配置工具

#### `cleanup-kiosk-v2.bat` ⭐ 改进版
**功能：** 彻底清理 Kiosk 配置，恢复正常 Windows 模式

**v2.0 改进：**
- ✅ 清理所有用户的 Shell 配置（不仅是 Default User）
- ✅ 修复了可能导致闪屏的问题
- ✅ 添加了验证步骤
- ✅ 更详细的日志记录

**做什么：**
1. 清理当前用户的 Shell 配置
2. 删除 kiosk 用户
3. 禁用自动登录
4. 恢复 Default User 的 Shell 配置
5. 清理 kiosk 用户的 Shell 配置
6. 保留虚拟键盘服务
7. 询问是否删除应用文件

**使用方法：**
```batch
# 方法1: 使用启动器（推荐）
双击 run-cleanup-v2-as-admin.bat

# 方法2: 手动以管理员身份运行
右键 cleanup-kiosk-v2.bat > 以管理员身份运行
```

**清理后：**
- kiosk 用户被删除
- 自动登录被禁用
- Shell 替换被清理
- Windows 恢复正常登录模式
- DreamBook 变为普通应用（需手动启动）

---

#### `verify-kiosk-v2.bat`
**功能：** 验证 Kiosk 配置或清理是否成功

**检查项目：**
1. kiosk 用户状态
2. 自动登录配置
3. 当前用户的 Shell 配置
4. Default User 的 Shell 配置
5. DreamBook 应用文件
6. 虚拟键盘服务
7. 系统默认 Shell

**使用方法：**
```batch
双击 verify-kiosk-v2.bat
```

**输出：**
- 详细的配置状态报告
- 发现的问题和警告
- 修复建议
- 日志文件：`verify-kiosk-v2.log`

---

## 🔄 完整使用流程

### 场景 1：清理 Kiosk 配置（推荐使用 v2.0）

```
1. 双击 run-cleanup-v2-as-admin.bat
2. 在 UAC 对话框中点击"是"
3. 根据提示输入 Y 确认清理
4. 选择是否删除应用文件
5. 重启电脑
6. 正常登录 Windows
```

### 场景 2：修复闪屏问题

```
1. 双击 run-fix-as-admin.bat
2. 在 UAC 对话框中点击"是"
3. 等待修复完成
4. 重启电脑
5. 正常登录
```

### 场景 3：验证配置状态

```
1. 双击 verify-kiosk-v2.bat
2. 查看检查结果
3. 根据建议采取行动
```

---

## 📊 版本对比

| 功能 | 旧版 (v1.1) | 新版 (v2.0) |
|------|------------|------------|
| 清理当前用户 Shell | ❌ | ✅ |
| 清理 Default User Shell | ✅ | ✅ |
| 清理 kiosk 用户 Shell | ❌ | ✅ |
| 验证清理结果 | ❌ | ✅ |
| 防止闪屏问题 | ❌ | ✅ |
| 详细日志 | 基础 | 完整 |

---

## ⚠️ 注意事项

### 管理员权限
所有配置和清理脚本都需要管理员权限，否则会失败。

### 日志文件
- 修复脚本：`fix-shell-config.log`
- 清理脚本：`cleanup-kiosk-v2.log`
- 验证脚本：`verify-kiosk-v2.log`

出现问题时请查看日志文件了解详细错误。

### 备份建议
清理或修复前建议：
- 创建系统还原点
- 或在虚拟机中测试

---

## 🆘 常见问题

### Q: 运行脚本后仍然闪屏？
A: 尝试以下步骤：
1. 进入安全模式（强制关机 3 次）
2. 在安全模式下运行 `fix-shell-config.bat`
3. 重启到正常模式

### Q: 如何重新配置 Kiosk 模式？
A: 清理配置后：
1. 确保应用部署到 `C:\kiosk\dreambook\`
2. 运行 `setup-kiosk.bat`
3. 重启测试

### Q: 清理后如何运行 DreamBook？
A: 清理后 DreamBook 变为普通应用：
1. 正常登录 Windows
2. 双击 DreamBook 图标启动
3. 不再是 Kiosk 模式（可以切换程序）

### Q: v1.1 和 v2.0 可以同时存在吗？
A: 可以，但请使用 v2.0：
- v2.0 修复了 v1.1 的闪屏问题
- v2.0 功能更完整
- v1.1 已过时，不推荐使用

---

## 🛠️ 技术细节

### Windows Shell 机制
- **Shell** 是用户登录后启动的程序
- 默认 Shell 是 `explorer.exe`（桌面环境）
- Kiosk 模式将 Shell 替换为 DreamBook

### Shell 配置位置
```
HKCU\...\Winlogon\Shell    ← 当前用户（优先级最高）
HKU\DEF\...\Winlogon\Shell  ← Default User（新用户模板）
HKU\KIOSK\...\Winlogon\Shell ← kiosk 用户
HKLM\...\Winlogon\Shell     ← 系统默认
```

### 为什么会闪屏？
1. Shell 配置指向不存在的程序
2. 程序启动失败
3. 配置清理不完整
→ 系统无法启动有效的 Shell，导致闪屏

---

## 📞 技术支持

如果以上方法都无法解决问题，请提供：
- 错误截图
- 日志文件（`.log` 文件）
- Windows 版本（运行 `winver` 查看）
- 具体错误描述

---

## 📝 更新日志

### v2.0 (2026-01-13)
- ✅ 新增：清理当前用户的 Shell 配置
- ✅ 新增：清理 kiosk 用户的 Shell 配置
- ✅ 新增：验证清理结果
- ✅ 修复：可能导致闪屏的问题
- ✅ 改进：更详细的日志记录
- ✅ 新增：配置验证脚本 v2.0

### v1.1 (原版)
- 基础清理功能
- 只清理 Default User
- ⚠️ 存在闪屏问题

---

## 📄 许可证

DreamBook © 2026 - 内部使用
