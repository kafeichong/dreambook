@echo off
net session >nul 2>&1
if %errorLevel% == 0 (
    call "%~dp0fix-shell-config.bat"
    goto :eof
)

echo Requesting administrator privileges...
powershell -Command "Start-Process cmd -ArgumentList '/c \"%~dp0fix-shell-config.bat\"' -Verb RunAs"
timeout /t 2 /nobreak >nul
exit
