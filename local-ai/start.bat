@echo off
chcp 65001 >nul
echo.
echo Thu muc AI da tach rieng. Chuyen sang may-tao-anh-ai...
cd /d "%~dp0..\..\may-tao-anh-ai"
if not exist "start.bat" (
  echo Khong tim thay may-tao-anh-ai\start.bat
  pause
  exit /b 1
)
call start.bat
