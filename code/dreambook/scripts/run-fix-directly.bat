@echo off
REM Direct run - requires manual right-click "Run as Administrator"
echo ========================================
echo DreamBook Shell Config Fix Tool
echo ========================================
echo.
echo Please run this file by:
echo 1. Right-click this file
echo 2. Select "Run as administrator"
echo 3. Click "Yes" in UAC dialog
echo.
pause

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires administrator privileges!
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

call "%~dp0fix-shell-config.bat"
