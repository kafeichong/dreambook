# DreamBook Kiosk 脚本工具集

## 📋 问题说明

原始的中文批处理脚本（`setup-kiosk.bat`、`cleanup-kiosk-v3.bat`）因编码问题导致无法执行，出现"不是内部或外部命令"错误或闪退。

本工具集提供了解决方案：英文版批处理 + PowerShell 版本 + 自动管理员权限启动器。

---

## 🚀 快速开始

### 配置 Kiosk 模式
```
双击 run-setup-as-admin.bat → 点击"是" → 等待完成 → 重启
```

### 清理 Kiosk 模式
```
双击 run-cleanup-as-admin.bat → 点击"是" → 输入 Y → 重启
```

### 修复虚拟键盘问题（Kiosk 用户下键盘无法显示）
```
双击 run-fix-keyboard-as-admin.bat → 点击"是" → 等待完成 → 重新登录
```

---

## 📁 文件说明

### ⭐ 推荐使用（一键启动）

| 文件 | 说明 |
|------|------|
| **run-setup-as-admin.bat** | 配置 Kiosk 模式（自动以管理员身份运行） |
| **run-cleanup-as-admin.bat** | 清理 Kiosk 模式（自动以管理员身份运行） |
| **run-fix-keyboard-as-admin.bat** | 修复 Kiosk 用户虚拟键盘问题 |

### 📜 可执行脚本

#### Setup 配置脚本
| 文件 | 类型 | 说明 |
|------|------|------|
| setup-kiosk-en.bat | 批处理（英文） | 配置脚本，避免编码问题 |
| setup-kiosk.ps1 | PowerShell（中文） | 配置脚本，彩色输出 |

#### Cleanup 清理脚本
| 文件 | 类型 | 说明 |
|------|------|------|
| cleanup-kiosk-v3-en.bat | 批处理（英文） | 清理脚本，避免编码问题 |
| cleanup-kiosk-v3.ps1 | PowerShell（中文） | 清理脚本，彩色输出 |

#### 虚拟键盘修复脚本
| 文件 | 类型 | 说明 |
|------|------|------|
| fix-keyboard-kiosk.bat | 批处理（英文） | 修复 kiosk 用户虚拟键盘权限 |
| fix-keyboard-kiosk.ps1 | PowerShell（中文） | 功能更强大的修复脚本 |
| diagnose-keyboard.bat | 批处理（英文） | 诊断虚拟键盘问题 |

### 📖 文档

| 文件 | 说明 |
|------|------|
| **README.md** | 总览文档（本文件） |
| **快速开始-Setup.txt** | Setup 配置一分钟上手指南 |
| **快速开始.txt** | Cleanup 清理一分钟上手指南 |
| **Setup配置指南.md** | Setup 配置详细文档 |
| **使用说明.md** | Cleanup 清理详细文档 |
| **虚拟键盘修复指南.md** | 虚拟键盘问题诊断和修复指南 |

### 🗑️ 旧文件（不推荐使用）

| 文件 | 说明 |
|------|------|
| setup-kiosk.bat | 原始中文版本（有编码问题） |
| cleanup-kiosk.bat | 原始中文版本（有编码问题） |
| verify-kiosk.bat | 验证脚本（待修复） |

---

## 🛠️ 功能说明

### Setup 配置功能

1. **创建 kiosk 用户**
   - 用户名: `kiosk`
   - 密码: `DreamBook2026!`

2. **配置自动登录**
   - 开机自动登录到 kiosk 用户

3. **配置 Shell 替换**
   - 将 Windows 桌面替代为 DreamBook 应用
   - 应用路径: `C:\kiosk\dreambook\dreambook.exe`

4. **启用虚拟键盘**
   - 自动启动触摸键盘服务

5. **设置应用权限**
   - 给 kiosk 用户完整的应用访问权限

### Cleanup 清理功能

1. **删除 kiosk 用户**
2. **禁用自动登录**
3. **删除 DreamBook 启动项**
4. **恢复系统界面配置**

---

## 📝 使用流程

### 完整 Kiosk 部署流程

```
1. 准备应用
   └─ 确保 DreamBook 应用已打包

2. 配置 Kiosk
   └─ 双击 run-setup-as-admin.bat
   └─ 等待配置完成

3. 部署应用
   └─ 将应用复制到 C:\kiosk\dreambook\
   └─ 确保主程序为 dreambook.exe

4. 重启电脑
   └─ 自动登录到 kiosk 用户
   └─ DreamBook 自动启动

5. （可选）清理配置
   └─ 双击 run-cleanup-as-admin.bat
   └─ 重启恢复正常模式
```

---

## ⚙️ 技术细节

### 编码问题原因

Windows 批处理脚本默认使用 GBK 编码，但如果脚本以 UTF-8 编码保存且包含中文，会导致：
- 命令无法识别（`echo` 变成乱码）
- 脚本闪退
- 显示乱码

### 解决方案

1. **英文版批处理**：完全避免中文，消除编码问题
2. **PowerShell 版本**：对 UTF-8 支持更好，可正确显示中文
3. **自动启动器**：使用英文批处理启动 PowerShell 脚本

---

## 🔧 故障排除

### 问题：双击脚本没反应或闪退
**解决方案：**
- 使用 `run-setup-as-admin.bat` 或 `run-cleanup-as-admin.bat`
- 右键选择"以管理员身份运行"

### 问题：提示"没有管理员权限"
**解决方案：**
- 点击 UAC 提示框的"是"按钮
- 或右键脚本，选择"以管理员身份运行"

### 问题：PowerShell 脚本无法运行
**解决方案：**
```powershell
# 以管理员身份打开 PowerShell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-kiosk.ps1  # 或 .\cleanup-kiosk-v3.ps1
```

### 问题：想要恢复正常模式
**解决方案：**
- 双击 `run-cleanup-as-admin.bat`
- 重启电脑

### 问题：Kiosk 用户下虚拟键盘无法显示
**症状：**
- Admin 账户下虚拟键盘正常
- Kiosk 用户下点击输入框，键盘不弹出

**解决方案：**
1. 双击 `run-fix-keyboard-as-admin.bat`
2. 等待修复完成
3. 如果 kiosk 用户当前已登录，需要注销后重新登录
4. 测试虚拟键盘功能

**诊断工具：**
- 运行 `diagnose-keyboard.bat` 获取详细诊断报告
- 查看详细文档：`虚拟键盘修复指南.md`

---

## 📊 日志文件

脚本执行时会生成日志文件：
- `setup-kiosk.log` - 配置日志
- `cleanup-kiosk-v3.log` - 清理日志
- `fix-keyboard-kiosk.log` - 虚拟键盘修复日志
- `keyboard-diagnostic.txt` - 虚拟键盘诊断报告

如遇问题，查看日志文件获取详细错误信息。

---

## 🔐 安全提示

1. **默认密码**：`DreamBook2026!`
   - 仅在专用 Kiosk 设备上使用
   - 如需修改，编辑脚本中的密码变量

2. **自动登录**：密码以明文存储在注册表
   - 不要在包含敏感数据的设备上使用
   - 仅用于公共展示设备

3. **用户权限**：kiosk 用户为标准用户
   - 无法修改系统设置
   - 仅能运行 DreamBook 应用

---

## 📚 推荐阅读顺序

1. **快速开始-Setup.txt** - 1分钟了解如何配置
2. **快速开始.txt** - 1分钟了解如何清理
3. **Setup配置指南.md** - 配置的详细文档
4. **使用说明.md** - 清理的详细文档

---

## ✅ 推荐使用方案

| 场景 | 推荐方案 | 备选方案 |
|------|----------|----------|
| 配置 Kiosk | `run-setup-as-admin.bat` | 右键 `setup-kiosk-en.bat` → 以管理员身份运行 |
| 清理 Kiosk | `run-cleanup-as-admin.bat` | 右键 `cleanup-kiosk-v3-en.bat` → 以管理员身份运行 |
| 喜欢中文界面 | `run-setup-as-admin.bat` (自动启动 PS 中文版) | 手动运行 `.ps1` 文件 |

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看对应的日志文件（`.log`）
2. 阅读详细文档（`.md`）
3. 使用备选方案（英文批处理版本）
4. 查看文档中的"手动执行步骤"

---

最后更新：2026-01-13
