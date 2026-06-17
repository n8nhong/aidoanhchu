@echo off
chcp 65001 >nul
echo.
echo Thu muc AI da chuyen sang may-tao-anh-ai (thu muc rieng).
echo Dang chuyen huong...
cd /d "%~dp0..\..\may-tao-anh-ai"
if not exist "install.bat" (
  echo.
  echo [LOI] Khong tim thay thu muc may-tao-anh-ai!
  echo Hay mo: Desktop\shopee\cua-hang-afili\may-tao-anh-ai\
if not defined NO_PAUSE pause
  exit /b 1
)
call install.bat
