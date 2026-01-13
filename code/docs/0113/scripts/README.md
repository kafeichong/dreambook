# DreamBook Kiosk 配置脚本

快速配置 Windows Kiosk 模式的工具集。

---

## 🚀 快速开始

### 1️⃣ 配置 Kiosk 模式
```
双击 run-setup-as-admin.bat
```
创建 kiosk 用户，配置自动登录，设置 DreamBook 为默认 Shell。

### 2️⃣ 修复虚拟键盘（Kiosk 用户下键盘不显示）
```
双击 run-fix-keyboard-as-admin.bat
```
**重要：** 运行前必须先注销 kiosk 用户！

### 3️⃣ 清理配置（恢复正常模式）
```
双击 run-cleanup-as-admin.bat
```
删除 kiosk 用户和所有配置。

---

## 📁 文件说明

### ⭐ 一键启动器（推荐使用）
| 文件 | 功能 |
|------|------|
| `run-setup-as-admin.bat` | 配置 Kiosk 模式 |
| `run-fix-keyboard-as-admin.bat` | 修复虚拟键盘 |
| `run-cleanup-as-admin.bat` | 清理 Kiosk 配置 |

### 🔧 核心脚本
| 文件 | 说明 |
|------|------|
| `setup-kiosk-en.bat` | Setup 批处理（英文，避免编码问题） |
| `setup-kiosk.ps1` | Setup PowerShell（中文，功能更强） |
| `cleanup-kiosk-v3-en.bat` | Cleanup 批处理（英文） |
| `cleanup-kiosk-v3.ps1` | Cleanup PowerShell（中文） |
| `fix-keyboard-kiosk-v2.bat` | 键盘修复 v2.0 批处理 |
| `fix-keyboard-kiosk-v2.ps1` | 键盘修复 v2.0 PowerShell |

### 🛠️ 工具
| 文件 | 说明 |
|------|------|
| `diagnose-keyboard.bat` | 诊断虚拟键盘问题 |

### 📖 文档
| 文件 | 说明 |
|------|------|
| `请先看这里-v2.txt` | 虚拟键盘修复快速指南 |

---

## ⚠️ 重要提示

### 配置 Kiosk
- ✅ 需要管理员权限
- ✅ 会创建用户：kiosk（密码：DreamBook2026!）
- ✅ 需要将应用部署到：`C:\kiosk\dreambook\dreambook.exe`
- ✅ 配置后需重启电脑

### 修复虚拟键盘
- ⚠️ **必须先注销 kiosk 用户**（否则无法修改注册表）
- ✅ 解决"拒绝访问"问题（v2.0 自动获取文件所有权）
- ✅ 创建手动启动快捷方式：`C:\kiosk\launch-keyboard.bat`
- ✅ 修复后需重新登录 kiosk 用户

### 清理配置
- ✅ 删除 kiosk 用户
- ✅ 禁用自动登录
- ✅ 恢复正常 Windows 界面
- ✅ 清理后需重启电脑

---

## 🔍 故障排除

### 问题：脚本闪退或显示乱码
**原因：** 编码问题
**解决：** 使用英文版脚本（*-en.bat）或 PowerShell 版本（*.ps1）

### 问题：提示"需要管理员权限"
**原因：** 未以管理员身份运行
**解决：** 使用 `run-*-as-admin.bat` 启动器

### 问题：虚拟键盘修复失败（"拒绝访问"）
**原因：** kiosk 用户正在登录中
**解决：**
1. 切换到管理员账户
2. **注销** kiosk 用户（不是切换用户！）
3. 重新运行 `run-fix-keyboard-as-admin.bat`
4. 重新登录 kiosk 用户

### 问题：虚拟键盘仍然不显示
**诊断：**
```
1. 运行 diagnose-keyboard.bat 生成诊断报告
2. 手动测试：C:\kiosk\launch-keyboard.bat
3. 查看日志：fix-keyboard-kiosk-v2.log
```

**备选方案：**
使用传统屏幕键盘 osk.exe（在代码中替换 TabTip.exe）

---

## 📝 日志文件

脚本执行时会生成日志：
- `setup-kiosk.log` - Setup 配置日志
- `cleanup-kiosk-v3.log` - Cleanup 清理日志
- `fix-keyboard-kiosk-v2.log` - 键盘修复日志
- `keyboard-diagnostic.txt` - 键盘诊断报告

---

## 🔐 安全信息

**默认密码：** `DreamBook2026!`
**注意：** 仅用于专用 Kiosk 设备，不要在包含敏感数据的设备上使用。

---

## 📂 旧文件

旧版本脚本和详细文档已移至 `_archive/` 文件夹。

---

**版本：** v2.0
**更新：** 2026-01-13
**适用：** Windows 10/11 x64
