# Windows 系统配置自动化脚本

> 用于快速配置 Windows 10 Kiosk 环境的批处理脚本

---

## 📝 脚本 1：一键配置 Kiosk 环境

**文件名：** `setup-kiosk.bat`

```batch
@echo off
REM ============================================
REM DreamBook Kiosk 一键配置脚本
REM 需要以管理员身份运行
REM ============================================

setlocal enabledelayedexpansion

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ❌ 错误：此脚本需要以管理员身份运行
    echo 请右键点击此文件，选择"以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo DreamBook Kiosk 一键配置脚本
echo ============================================
echo.

REM 设置变量
set KIOSK_USER=kiosk
set KIOSK_PASSWORD=your_password_here
set DREAMBOOK_PATH=C:\kiosk\dreambook\dreambook.exe
set LOG_FILE=%~dp0setup-kiosk.log

echo [%date% %time%] 开始配置 >> %LOG_FILE%

REM ============================================
REM 步骤 1：创建 kiosk 用户
REM ============================================
echo.
echo [步骤 1/5] 创建 kiosk 用户账户...
echo [%date% %time%] 创建 kiosk 用户 >> %LOG_FILE%

REM 检查用户是否已存在
net user %KIOSK_USER% >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ kiosk 用户已存在，跳过创建
    echo [%date% %time%] kiosk 用户已存在 >> %LOG_FILE%
) else (
    net user %KIOSK_USER% %KIOSK_PASSWORD% /add
    if %errorLevel% equ 0 (
        echo ✅ kiosk 用户创建成功
        echo [%date% %time%] kiosk 用户创建成功 >> %LOG_FILE%
    ) else (
        echo ❌ kiosk 用户创建失败
        echo [%date% %time%] kiosk 用户创建失败 >> %LOG_FILE%
        goto ERROR
    )
)

REM ============================================
REM 步骤 2：设置自动登录
REM ============================================
echo.
echo [步骤 2/5] 设置自动登录...
echo [%date% %time%] 设置自动登录 >> %LOG_FILE%

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" ^
    /v DefaultUserName /t REG_SZ /d %KIOSK_USER% /f >nul 2>&1

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" ^
    /v DefaultPassword /t REG_SZ /d %KIOSK_PASSWORD% /f >nul 2>&1

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" ^
    /v AutoAdminLogon /t REG_SZ /d 1 /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ 自动登录配置成功
    echo [%date% %time%] 自动登录配置成功 >> %LOG_FILE%
) else (
    echo ❌ 自动登录配置失败
    echo [%date% %time%] 自动登录配置失败 >> %LOG_FILE%
    goto ERROR
)

REM ============================================
REM 步骤 3：配置 Shell 替换
REM ============================================
echo.
echo [步骤 3/5] 配置 Shell 替换...
echo [%date% %time%] 配置 Shell 替换 >> %LOG_FILE%

REM 加载 Default User 注册表
reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >nul 2>&1

REM 设置 Shell
reg add "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" ^
    /v Shell /t REG_SZ /d "%DREAMBOOK_PATH%" /f >nul 2>&1

REM 卸载注册表
reg unload HKU\DEF >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ Shell 替换配置成功
    echo [%date% %time%] Shell 替换配置成功 >> %LOG_FILE%
) else (
    echo ❌ Shell 替换配置失败
    echo [%date% %time%] Shell 替换配置失败 >> %LOG_FILE%
    goto ERROR
)

REM ============================================
REM 步骤 4：启用虚拟键盘服务
REM ============================================
echo.
echo [步骤 4/5] 启用虚拟键盘服务...
echo [%date% %time%] 启用虚拟键盘服务 >> %LOG_FILE%

sc config TabletInputService start= auto >nul 2>&1
sc start TabletInputService >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ 虚拟键盘服务启用成功
    echo [%date% %time%] 虚拟键盘服务启用成功 >> %LOG_FILE%
) else (
    echo ⚠️  虚拟键盘服务启用失败（可能已启用）
    echo [%date% %time%] 虚拟键盘服务启用失败 >> %LOG_FILE%
)

REM ============================================
REM 步骤 5：验证配置
REM ============================================
echo.
echo [步骤 5/5] 验证配置...
echo [%date% %time%] 验证配置 >> %LOG_FILE%

echo.
echo 验证结果：
echo.

REM 验证用户
net user %KIOSK_USER% >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ kiosk 用户存在
) else (
    echo ❌ kiosk 用户不存在
)

REM 验证自动登录
for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon 2^>nul ^| findstr AutoAdminLogon') do (
    if "%%a"=="1" (
        echo ✅ 自动登录已启用
    ) else (
        echo ❌ 自动登录未启用
    )
)

REM 验证虚拟键盘服务
sc query TabletInputService | findstr "RUNNING" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ 虚拟键盘服务运行中
) else (
    echo ⚠️  虚拟键盘服务未运行
)

echo.
echo ============================================
echo ✅ 配置完成！
echo ============================================
echo.
echo 后续步骤：
echo 1. 将 dreambook.exe 复制到 %DREAMBOOK_PATH%
echo 2. 重启电脑
echo 3. 应该自动进入 dreambook 应用
echo.
echo 日志文件：%LOG_FILE%
echo.
pause
exit /b 0

:ERROR
echo.
echo ============================================
echo ❌ 配置失败！
echo ============================================
echo.
echo 请检查：
echo 1. 是否以管理员身份运行此脚本
echo 2. 是否有足够的磁盘空间
echo 3. 是否有网络连接
echo.
echo 日志文件：%LOG_FILE%
echo.
pause
exit /b 1
```

---

## 📝 脚本 2：验证 Kiosk 配置

**文件名：** `verify-kiosk.bat`

```batch
@echo off
REM ============================================
REM DreamBook Kiosk 配置验证脚本
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo DreamBook Kiosk 配置验证
echo ============================================
echo.

set KIOSK_USER=kiosk
set DREAMBOOK_PATH=C:\kiosk\dreambook\dreambook.exe

REM ============================================
REM 检查 1：kiosk 用户
REM ============================================
echo [检查 1] kiosk 用户账户
echo ────────────────────────────────────────

net user %KIOSK_USER% >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ kiosk 用户存在
    net user %KIOSK_USER% | findstr "Account active"
) else (
    echo ❌ kiosk 用户不存在
)

echo.

REM ============================================
REM 检查 2：自动登录配置
REM ============================================
echo [检查 2] 自动登录配置
echo ────────────────────────────────────────

for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon 2^>nul ^| findstr AutoAdminLogon') do (
    if "%%a"=="1" (
        echo ✅ AutoAdminLogon = 1 (已启用)
    ) else (
        echo ❌ AutoAdminLogon = %%a (未启用)
    )
)

for /f "tokens=3" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName 2^>nul ^| findstr DefaultUserName') do (
    echo ✅ DefaultUserName = %%a
)

echo.

REM ============================================
REM 检查 3：Shell 配置
REM ============================================
echo [检查 3] Shell 配置
echo ────────────────────────────────────────

for /f "tokens=3*" %%a in ('reg query "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell 2^>nul ^| findstr Shell') do (
    echo ✅ Shell = %%a %%b
)

echo.

REM ============================================
REM 检查 4：虚拟键盘服务
REM ============================================
echo [检查 4] 虚拟键盘服务
echo ────────────────────────────────────────

sc query TabletInputService | findstr "STATE" >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=4" %%a in ('sc query TabletInputService ^| findstr STATE') do (
        if "%%a"=="RUNNING" (
            echo ✅ TabletInputService 运行中
        ) else (
            echo ⚠️  TabletInputService 状态：%%a
        )
    )
) else (
    echo ❌ TabletInputService 不存在
)

echo.

REM ============================================
REM 检查 5：dreambook.exe 文件
REM ============================================
echo [检查 5] dreambook.exe 文件
echo ────────────────────────────────────────

if exist "%DREAMBOOK_PATH%" (
    echo ✅ 文件存在：%DREAMBOOK_PATH%
    for %%a in ("%DREAMBOOK_PATH%") do (
        echo   大小：%%~za 字节
        echo   修改时间：%%~ta
    )
) else (
    echo ❌ 文件不存在：%DREAMBOOK_PATH%
    echo   请将 dreambook.exe 复制到此路径
)

echo.

REM ============================================
REM 检查 6：防火墙规则
REM ============================================
echo [检查 6] 防火墙规则
echo ────────────────────────────────────────

netsh advfirewall firewall show rule name="dreambook" >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ dreambook 防火墙规则已配置
) else (
    echo ⚠️  dreambook 防火墙规则未配置（可选）
)

echo.

REM ============================================
REM 总结
REM ============================================
echo ============================================
echo 验证完成
echo ============================================
echo.
echo 如果所有检查都显示 ✅，则配置正确。
echo 如果有 ❌ 或 ⚠️，请参考完整修改步骤进行修复。
echo.
pause
```

---

## 📝 脚本 3：清理 Kiosk 配置

**文件名：** `cleanup-kiosk.bat`

```batch
@echo off
REM ============================================
REM DreamBook Kiosk 清理脚本
REM 用于恢复正常 Windows 环境
REM 需要以管理员身份运行
REM ============================================

setlocal enabledelayedexpansion

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ❌ 错误：此脚本需要以管理员身份运行
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo DreamBook Kiosk 清理脚本
echo ============================================
echo.
echo ⚠️  警告：此脚本将恢复 Windows 正常环境
echo 这将删除 kiosk 用户和相关配置
echo.

set /p CONFIRM="确定要继续吗？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消
    exit /b 0
)

echo.

REM ============================================
REM 步骤 1：禁用自动登录
REM ============================================
echo [步骤 1/3] 禁用自动登录...

reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" ^
    /v AutoAdminLogon /t REG_SZ /d 0 /f >nul 2>&1

reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" ^
    /v DefaultPassword /f >nul 2>&1

echo ✅ 自动登录已禁用

REM ============================================
REM 步骤 2：恢复默认 Shell
REM ============================================
echo [步骤 2/3] 恢复默认 Shell...

reg load HKU\DEF "C:\Users\Default\NTUSER.DAT" >nul 2>&1
reg delete "HKU\DEF\Software\Microsoft\Windows NT\CurrentVersion\Winlogon" ^
    /v Shell /f >nul 2>&1
reg unload HKU\DEF >nul 2>&1

echo ✅ Shell 已恢复

REM ============================================
REM 步骤 3：删除 kiosk 用户
REM ============================================
echo [步骤 3/3] 删除 kiosk 用户...

net user kiosk /delete >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ kiosk 用户已删除
) else (
    echo ⚠️  kiosk 用户删除失败（可能已删除）
)

echo.
echo ============================================
echo ✅ 清理完成！
echo ============================================
echo.
echo 请重启电脑以应用更改
echo.
pause
```

---

## 🚀 使用说明

### 第一次部署

```bash
# 1. 以管理员身份运行配置脚本
setup-kiosk.bat

# 2. 将 dreambook.exe 复制到 C:\kiosk\dreambook\
Copy-Item -Path "dist/dreambook.exe" -Destination "C:\kiosk\dreambook\" -Force

# 3. 验证配置
verify-kiosk.bat

# 4. 重启电脑
Restart-Computer
```

### 日常维护

```bash
# 验证配置是否正确
verify-kiosk.bat

# 更新应用
Copy-Item -Path "dist/dreambook.exe" -Destination "C:\kiosk\dreambook\" -Force
Restart-Computer
```

### 恢复正常环境

```bash
# 清理所有 Kiosk 配置
cleanup-kiosk.bat

# 重启电脑
Restart-Computer
```

---

## 📋 脚本参数自定义

### 修改 kiosk 用户名

编辑脚本中的：
```batch
set KIOSK_USER=kiosk
```

改为：
```batch
set KIOSK_USER=your_username
```

### 修改 dreambook 路径

编辑脚本中的：
```batch
set DREAMBOOK_PATH=C:\kiosk\dreambook\dreambook.exe
```

改为：
```batch
set DREAMBOOK_PATH=D:\your\path\dreambook.exe
```

---

## ✅ 脚本检查清单

- [x] 创建 kiosk 用户
- [x] 设置自动登录
- [x] 配置 Shell 替换
- [x] 启用虚拟键盘服务
- [x] 验证所有配置
- [x] 清理功能
- [x] 错误处理
- [x] 日志记录

---

**最后更新：** 2026-01-13
**版本：** 1.0
**状态：** ✅ 完成
