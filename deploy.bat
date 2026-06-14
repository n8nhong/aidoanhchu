@echo off
setlocal
pushd %~dp0
rem Thêm và commit mọi thay đổi
git add .
git commit -m "Auto deploy %date% %time%"
git push origin main
echo.
echo ==== Đã đẩy lên GitHub ====
echo Kiểm tra GitHub Actions để xem quá trình Deploy.
pause
