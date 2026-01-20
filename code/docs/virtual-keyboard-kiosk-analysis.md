# Windows Kiosk 模式虚拟键盘（TabTip）问题分析

## 1. 背景与现状

当前项目在 Windows 触摸屏设备上通过 **Electron 主进程拉起系统触摸键盘（TabTip）** 来实现输入体验：

- 前端在输入框事件里调用 `window.electronAPI.showVirtualKeyboard()`（`code/dreambook/src/hooks/useVirtualKeyboard.ts`）。
- 预加载脚本通过 IPC 暴露 `showVirtualKeyboard`（`code/dreambook/electron/preload.ts`）。
- 主进程处理 `show-virtual-keyboard` 并尝试用 PowerShell/TabTip/URI 启动键盘（`code/dreambook/electron/main.ts`）。

问题表现：**Admin（管理员账号/环境）能弹出键盘，但 Kiosk（kiosk 账号/环境）不弹出**。

> 这类差异常见原因不是 React 事件，而是 **kiosk 账号的系统策略/服务/每用户注册表配置** 与 admin 不一致。

---

## 2. 外部参考（相似项目/讨论的共识）

### Electron 相关讨论
- `electron/electron#21816`：Electron 中启动 `TabTip.exe` 可能出现“进程在，但键盘界面不显示”。有讨论提到需要关注 **窗口焦点/前台状态**，否则 TabTip 可能不出现在用户视野中。

### WPF 触摸键盘通用方案（WPFTabTip）
`WPFTabTip`（WPF 项目）是一个经常被引用的 TabTip 集成实现，关键点：
- 打开前确保写入 **当前用户（HKCU）** 注册表：
  - `HKCU\Software\Microsoft\TabletTip\1.7\EnableDesktopModeAutoInvoke = 1`
- 用 **完整路径** 启动 TabTip：
  - `C:\Program Files\Common Files\microsoft shared\ink\TabTip.exe`
- 处理 `EdgeTargetDockedState`，必要时杀掉后台 TabTip 再拉起，避免“TabTip 已在后台但不可见”。

---

## 3. 结合本项目代码的高概率差异点

以下点都与“admin 能用 / kiosk 不能用”的典型模式吻合：

1) **每用户注册表缺失**
- 项目已有 Kiosk 配置脚本 `code/dreambook/scripts/setup-kiosk-v3.bat`，会启动 `TabletInputService` 服务，但**没有为 kiosk 用户写 HKCU 的 `EnableDesktopModeAutoInvoke` / `EdgeTargetDockedState`**。
- 这会导致：管理员账号下可能已配置过（或系统默认更宽松），而 kiosk 新账号下未配置 → TabTip 不弹或弹不出来。

2) **启动方式依赖环境**
- 主进程 PowerShell 路径中运行的是 `"tabtip.exe"`（依赖 PATH），相比之下外部方案更推荐使用 **完整路径**。
- `findTabTipPath()` 当前固定返回 64 位路径且不做存在性校验，kiosk 环境若缺失组件/路径不同，失败更隐蔽。

3) **窗口焦点/前台干扰**
- IPC 里会先 `mainWindow.focus()`（`code/dreambook/electron/main.ts` 的 IPC handler），但有外部讨论提到 TabTip 显示可能受前台/焦点影响；在某些 kiosk/全屏策略下，强行聚焦可能让 TabTip 被抑制或被压在后面。
- 你们已做了“伪全屏（高度 -1px）”来规避 Windows 全屏抑制，这说明团队之前也遇到过类似系统交互问题。

4) **系统级 Kiosk/白名单策略拦截（需排查）**
- 若设备启用了 Windows Assigned Access、AppLocker、WDAC 等，常见现象是：管理员账号可运行 `TabTip.exe`/`powershell.exe`，kiosk 账号被拦截。

---

## 4. 建议的改进方向（先分析，后续再落代码）

优先级从高到低：

1) **先把问题分层定位：调用链 vs 系统不显示**
- kiosk 账号下点输入框后，检查日志 `~/dreambook-logs/app-YYYY-MM-DD.log` 是否出现 `[虚拟键盘]` 相关日志：
  - 无日志：可能是 `electronAPI` 未注入/事件未触发/IPC 未走到。
  - 有日志但失败：系统权限/策略/注册表/路径/焦点导致 TabTip 不可见。

2) **把“每用户 TabTip 配置”纳入 Kiosk 方案**
- 参考 WPFTabTip，确保 kiosk 用户的 HKCU：
  - `EnableDesktopModeAutoInvoke=1`
  - 必要时 `EdgeTargetDockedState=0`

3) **启动策略更稳健**
- 优先使用 TabTip 完整路径启动，必要时检测存在性并降级到其他方式。
- 处理“TabTip 已在后台但不可见”的状态：必要时先结束后台 TabTip 再拉起。

4) **评估 `mainWindow.focus()` 是否反而影响 TabTip 显示**
- 做对照实验：在 kiosk 账号环境下验证“聚焦/不聚焦”对可见性的影响。

5) **若有白名单策略，明确把依赖程序加入允许列表**
- `TabTip.exe`、（若仍依赖）`powershell.exe`、以及你们可能用到的 `cmd.exe`/`start`。

---

## 5. 不改代码的快速验证清单（用于确认根因）

在 **kiosk 账号** 下手动执行（不需要管理员权限）：

```bat
reg add "HKCU\\Software\\Microsoft\\TabletTip\\1.7" /v EnableDesktopModeAutoInvoke /t REG_DWORD /d 1 /f
reg add "HKCU\\Software\\Microsoft\\TabletTip\\1.7" /v EdgeTargetDockedState /t REG_DWORD /d 0 /f
taskkill /IM TabTip.exe /F
"C:\\Program Files\\Common Files\\microsoft shared\\ink\\TabTip.exe"
```

如果这样能稳定弹出键盘，基本可以判定：问题核心是 **kiosk 用户缺少 TabTip 的每用户配置/状态**，而不是前端事件本身。

---

## 6. 需要补充的信息（决定最终方案）

为把方案收敛到“最小改动且命中率最高”的路线，建议确认：

1) “Admin / Kiosk”具体指的是 **Windows 管理员账号 vs kiosk 账号**，还是仅指应用内的管理面板状态？
2) 设备系统版本：Win10 还是 Win11？
3) 是否启用了 Assigned Access / AppLocker / WDAC / 其他白名单策略？

