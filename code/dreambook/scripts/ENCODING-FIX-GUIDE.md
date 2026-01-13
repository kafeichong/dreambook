# Windows Batch File Encoding Issue Fix

## Problem
Batch files created on macOS may have encoding/line-ending issues on Windows, causing errors like:
```
'某某命令' 不是内部或外部命令，也不是可运行的程序或批处理文件
```

## Solution Options

### Option 1: Use English Version Scripts (Recommended)

We've created English-only versions to avoid encoding issues:

**Files:**
- `fix-shell-simple.bat` - Main fix script (English, no Chinese)
- `run-fix-directly.bat` - Must right-click "Run as administrator"
- `run-fix-as-admin-simple.bat` - Attempts auto elevation

**Usage:**
1. Copy `run-fix-directly.bat` to Windows
2. **Right-click** the file
3. Select **"Run as administrator"** (以管理员身份运行)
4. Click "Yes" in UAC dialog
5. Wait for completion
6. Restart computer

### Option 2: Fix Encoding on Windows

If you need to use the Chinese version:

**Method A: Re-save in Notepad**
1. Open the `.bat` file in Notepad
2. File > Save As
3. Encoding: select **"ANSI"**
4. Save

**Method B: Use Notepad++**
1. Open the `.bat` file in Notepad++
2. Encoding > Convert to ANSI
3. Edit > EOL Conversion > Windows (CR LF)
4. Save

**Method C: Command Line**
```batch
REM Create new file with correct encoding
type original.bat > fixed.bat
```

### Option 3: Create Directly on Windows

**Create a new `.bat` file on Windows:**

1. Open Notepad (记事本)
2. Copy this content:

```batch
@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires administrator privileges!
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

call "%~dp0fix-shell-config.bat"
```

3. Save As:
   - File name: `run-fix.bat`
   - Encoding: **ANSI**
   - Save

4. Right-click `run-fix.bat` > Run as administrator

## Recommended Approach

**Use the simplified English version:**

1. Transfer `fix-shell-simple.bat` to Windows
2. Right-click > Properties
3. Check "Unblock" if shown at bottom
4. Right-click > **Run as administrator**
5. Follow prompts
6. Restart computer

## File Encoding Reference

| Platform | Encoding | Line Ending | Works on Windows? |
|----------|----------|-------------|-------------------|
| Windows Notepad | ANSI (GBK) | CRLF | ✅ Yes |
| Windows Notepad | UTF-8 with BOM | CRLF | ✅ Yes |
| macOS TextEdit | UTF-8 no BOM | LF | ❌ May fail |
| macOS Terminal | UTF-8 no BOM | LF | ❌ May fail |

## Quick Test

After fixing encoding, test with:
```batch
@echo off
echo Test encoding
pause
```

If you see "Test encoding" correctly, the encoding is fixed.

## Still Having Issues?

1. **Try PowerShell instead:**
   ```powershell
   Start-Process powershell -Verb RunAs -ArgumentList "-File fix-shell-config.ps1"
   ```

2. **Manual fix (safest):**
   - Press `Ctrl+Alt+Del`
   - Task Manager > File > Run new task
   - Type: `regedit` (check "Run as administrator")
   - Delete: `HKEY_CURRENT_USER\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell`
   - Restart computer

## Files Created

| File | Description | Encoding |
|------|-------------|----------|
| `fix-shell-simple.bat` | English fix script | UTF-8 (may need conversion) |
| `run-fix-directly.bat` | Manual admin launcher | UTF-8 (may need conversion) |
| `run-fix-as-admin-simple.bat` | Auto elevation | UTF-8 (may need conversion) |

**All files should be re-saved as ANSI on Windows for best compatibility.**
