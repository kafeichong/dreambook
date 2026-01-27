# DreamBook Kiosk 配置脚本使用指南

## 问题说明

原始的 `setup-kiosk.bat` 因为编码问题导致闪退，无法正常创建 kiosk 用户。

## 解决方案

提供了三个可用版本：

### ⭐ 1. run-setup-as-admin.bat（最简单）
- **自动以管理员身份运行 PowerShell 脚本**
- **使用方法：** 直接双击即可
  1. 双击文件
  2. 点击"是"（UAC 提示）
  3. 等待配置完成

### 2. setup-kiosk-en.bat
- **英文界面批处理脚本**
- **优点：** 完全避免编码问题
- **使用方法：**
  1. 右键点击文件
  2. 选择"以管理员身份运行"
  3. 等待配置完成

### 3. setup-kiosk.ps1
- **PowerShell 中文界面脚本**
- **优点：** 支持中文显示，错误处理更完善
- **使用方法：** 使用 `run-setup-as-admin.bat` 运行

## 配置内容

脚本会自动执行以下操作：

1. **创建 kiosk 用户**
   - 用户名: `kiosk`
   - 密码: `DreamBook2026!`

2. **配置自动登录**
   - 开机自动登录到 kiosk 用户

3. **配置 Shell 替换**
   - 将 Windows 桌面替换为 DreamBook 应用
   - 应用路径: `C:\kiosk\dreambook\dreambook.exe`

4. **启用虚拟键盘**
   - 自动启动触摸键盘服务

5. **设置应用权限**
   - 给 kiosk 用户完整的应用访问权限

## 使用前准备

1. **确保有管理员权限**
2. **部署应用到指定路径** (可选，后续也可以部署)
   - 将 DreamBook 应用放到 `C:\kiosk\dreambook\` 目录
   - 确保主程序文件为 `dreambook.exe`

## 配置步骤

### 方式 A: 最简单（推荐）
```
1. 双击 run-setup-as-admin.bat
2. 点击"是"（UAC 提示）
3. 等待配置完成
4. 查看配置总结
```

### 方式 B: 使用英文批处理版本
```
1. 右键 setup-kiosk-en.bat
2. 选择"以管理员身份运行"
3. 等待配置完成
4. 查看配置总结
```

## 配置完成后

1. **查看配置总结**
   - 确认所有配置项都成功

2. **部署应用**（如果还没部署）
   - 将应用复制到 `C:\kiosk\dreambook\`
   - 确保主程序名为 `dreambook.exe`

3. **验证配置**（可选）
   - 运行 `verify-kiosk.bat` 验证配置是否正确

4. **重启电脑**
   - 重启后会自动登录到 kiosk 用户
   - DreamBook 应用会自动启动（替代 Windows 桌面）

## 日志文件

执行过程会生成 `setup-kiosk.log` 日志文件，记录所有操作详情。

## 故障排除

### 问题：脚本闪退或显示乱码
**解决方案：** 使用 `run-setup-as-admin.bat` 或 `setup-kiosk-en.bat`

### 问题：提示"没有管理员权限"
**解决方案：**
- 右键脚本，选择"以管理员身份运行"
- 或使用 `run-setup-as-admin.bat`（会自动请求管理员权限）

### 问题：PowerShell 脚本无法运行
**解决方案：**
```powershell
# 以管理员身份打开 PowerShell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 然后运行脚本
cd 到脚本所在目录
.\setup-kiosk.ps1
```

### 问题：提示"应用文件不存在"
**解决方案：**
- 这是警告而非错误，配置仍会继续
- 配置完成后再部署应用即可
- 应用需部署到: `C:\kiosk\dreambook\dreambook.exe`

### 问题：虚拟键盘服务启动失败
**解决方案：**
- 这是警告而非错误，不影响主要功能
- 可以手动启动服务：
  ```cmd
  sc config TabletInputService start= auto
  sc start TabletInputService
  ```

### 问题：配置失败，想要清理重试
**解决方案：**
- 运行 `run-cleanup-as-admin.bat` 清理所有配置
- 然后重新运行 setup 脚本

## 手动配置步骤

如果所有脚本都无法运行，可以手动执行以下命令（以管理员身份运行 cmd）：

```batch
# 1. 创建用户
net user kiosk DreamBook2026! /add

# 2. 配置自动登录
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /t REG_SZ /d kiosk /f
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /t REG_SZ /d DreamBook2026! /f
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 1 /f

# 3. 配置 Shell（需要先创建应用目录）
reg load HKU\DEF "C:\Users\Default\NTUSER.DAT"
reg add "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /t REG_SZ /d "C:\kiosk\dreambook\dreambook.exe" /f
reg unload HKU\DEF

# 4. 启用虚拟键盘
sc config TabletInputService start= auto
sc start TabletInputService

# 5. 设置权限（如果应用目录存在）
icacls "C:\kiosk\dreambook" /grant "kiosk:(OI)(CI)F" /T
```

## 安全提示

1. **默认密码**：`DreamBook2026!`
   - 如需修改，编辑脚本中的 `KIOSK_PASSWORD` 变量

2. **自动登录**：密码会以明文存储在注册表中
   - 仅在专用 Kiosk 设备上使用
   - 不要在包含敏感数据的设备上使用

3. **用户权限**：kiosk 用户默认为标准用户
   - 权限受限，无法修改系统设置
   - 仅能运行 DreamBook 应用

## 推荐使用顺序

1. **首选：** 双击 `run-setup-as-admin.bat`（最简单！）
2. **备选：** 右键 `setup-kiosk-en.bat` → "以管理员身份运行"
3. **最后：** 手动执行命令
