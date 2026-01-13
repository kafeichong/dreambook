# DreamBook Kiosk 模式配置指南 v3.0

## 🎯 目标

1. ✅ 创建 kiosk 用户，开机自动登录
2. ✅ 自动启动 DreamBook 应用
3. ✅ 触摸键盘能正常弹出
4. ✅ 稳定可靠，不会闪屏

---

## ⚠️ 重要改进

### v3.0 vs 旧版本

| 功能 | 旧版 (v1.0) | 新版 (v3.0) |
|------|-------------|-------------|
| 启动方式 | 替换 Shell | 注册表启动项 ✅ |
| 稳定性 | 容易闪屏 ❌ | 稳定可靠 ✅ |
| 易恢复 | 困难 | 简单 ✅ |
| 虚拟键盘 | 可能失效 | 正常工作 ✅ |

**核心改进：** 不再替换 Windows Shell，使用启动项方式，就像普通应用开机启动一样。

---

## 📋 配置步骤

### 步骤 1：准备应用

确保 DreamBook 已部署到：
```
C:\kiosk\dreambook\dreambook.exe
```

### 步骤 2：运行配置脚本

1. 右键 `setup-kiosk-v3.bat`
2. 选择 **"以管理员身份运行"**
3. 根据提示输入 `Y` 确认
4. 等待配置完成

### 步骤 3：重启测试

1. 重启电脑
2. 系统自动登录 `kiosk` 用户
3. DreamBook 自动启动
4. 测试触摸键盘是否能弹出

---

## 🔧 配置说明

### 创建的配置

1. **用户账户**
   - 用户名：`kiosk`
   - 密码：`DreamBook2026!`
   - 类型：标准用户

2. **自动登录**
   - 启用自动登录
   - 登录用户：kiosk
   - 无需输入密码

3. **应用启动**
   - 位置：`HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`
   - 键名：`DreamBook`
   - 值：`C:\kiosk\dreambook\dreambook.exe`

4. **虚拟键盘**
   - 服务：`TabletInputService`
   - 启动类型：自动
   - 状态：运行中

### 不同于旧版

- ✅ **不替换 Shell** - explorer.exe 仍然运行
- ✅ **有桌面环境** - 有任务栏和桌面（但 DreamBook 全屏覆盖）
- ✅ **易于调试** - 可以 Alt+Tab 切换程序
- ✅ **不会闪屏** - Windows 正常启动

---

## 🎹 虚拟键盘使用

### Electron 端已实现

在 `electron/main.ts` 中：
```javascript
ipcMain.handle('show-virtual-keyboard', () => {
  // 调用 Windows 触摸键盘
  showWindowsVirtualKeyboard()
})
```

### React 端调用

在输入框获得焦点时：
```typescript
const handleFocus = () => {
  if (window.electronAPI) {
    window.electronAPI.showVirtualKeyboard()
  }
}

<input onFocus={handleFocus} />
```

### v3.0 下键盘工作原理

1. ✅ TabletInputService 服务运行
2. ✅ explorer.exe 运行（不影响）
3. ✅ DreamBook 调用 TabTip.exe
4. ✅ 键盘正常弹出

---

## 🚪 退出 Kiosk 模式

### 方法 1：使用应用内管理面板

1. 点击右上角 5 次
2. 打开管理面板
3. 点击"退出应用"或"切换用户"

### 方法 2：使用清理脚本

1. 按 `Ctrl+Alt+Del`
2. 任务管理器 > 文件 > 运行新任务
3. 输入：`cmd` （勾选管理员权限）
4. 运行：`cleanup-kiosk-v3.bat`
5. 重启电脑

### 方法 3：手动清理

```batch
# 删除启动项
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v DreamBook /f

# 禁用自动登录
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 0 /f

# 重启
shutdown /r /t 0
```

---

## 🔍 故障排查

### 问题 1：重启后没有自动登录

**检查：**
```batch
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon
```

**应该显示：** `AutoAdminLogon    REG_SZ    1`

**修复：**
```batch
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d 1 /f
```

### 问题 2：DreamBook 没有自动启动

**检查：**
```batch
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v DreamBook
```

**应该显示：** `DreamBook    REG_SZ    C:\kiosk\dreambook\dreambook.exe`

**修复：**
```batch
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v DreamBook /t REG_SZ /d "C:\kiosk\dreambook\dreambook.exe" /f
```

### 问题 3：虚拟键盘不弹出

**检查服务：**
```batch
sc query TabletInputService
```

**应该显示：** `STATE : 4 RUNNING`

**修复：**
```batch
sc config TabletInputService start= auto
sc start TabletInputService
```

**检查 Electron 代码：**
- `electron/main.ts` 中的 `showWindowsVirtualKeyboard()` 函数
- `electron/preload.ts` 中的 `showVirtualKeyboard` IPC

### 问题 4：还是出现闪屏

**不应该出现！** v3.0 不替换 Shell，不会闪屏。

如果仍然闪屏，检查：
```batch
# 确保没有 Shell 替换配置
reg query "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell
reg query "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell
```

如果存在，删除：
```batch
reg delete "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /f
```

---

## 📊 配置对比

| 配置项 | 旧版方法 | v3.0 方法 |
|--------|----------|-----------|
| Shell | dreambook.exe | explorer.exe (默认) |
| 启动方式 | Shell 替换 | 注册表启动项 |
| 桌面 | 无 | 有（被覆盖） |
| 任务栏 | 无 | 有（被隐藏） |
| 调试 | 困难 | 容易 (Alt+Tab) |
| 恢复 | 复杂 | 简单 |

---

## ✅ 验证配置

运行验证脚本：
```batch
verify-kiosk-v3.bat
```

检查项：
- ✅ kiosk 用户存在
- ✅ 自动登录已启用
- ✅ 启动项已配置
- ✅ 虚拟键盘服务运行
- ✅ 应用文件存在

---

## 📝 总结

### v3.0 的优势

1. ✅ **稳定可靠** - 不替换 Shell，不会闪屏
2. ✅ **易于调试** - 可以切换到其他程序
3. ✅ **键盘正常** - TabletInputService 正常工作
4. ✅ **易于恢复** - 简单删除启动项即可

### 推荐流程

```
1. 部署应用到 C:\kiosk\dreambook\
   ↓
2. 运行 setup-kiosk-v3.bat
   ↓
3. 重启电脑
   ↓
4. 测试虚拟键盘
   ↓
5. 如需退出，运行 cleanup-kiosk-v3.bat
```

---

## 📞 需要帮助？

- 查看日志：`setup-kiosk-v3.log`
- 运行验证：`verify-kiosk-v3.bat`
- 清理配置：`cleanup-kiosk-v3.bat`
