@echo off
rem ------------------------------------------------------------
rem Deploy.bat – Tự động đẩy code lên GitHub và xây dựng dự án React
rem Đặt trong thư mục gốc của dự án: Affilishop-main
rem ------------------------------------------------------------

rem Định vị thư mục của script, tránh lỗi đường dẫn
cd /d "%~dp0"

rem Kiểm tra trạng thái Git
echo ==== Kiểm tra Git ====
git status

rem Thêm và commit (nếu có thay đổi)
git add .
git commit -m "Auto deploy – cập nhật code" || echo No changes to commit.

rem Đẩy lên GitHub
echo ==== Đẩy lên GitHub ====
git push origin main

rem Cài đặt và build React
echo ==== Cài đặt dependencies ====
npm install
if errorlevel 1 (
    echo Lỗi khi cài npm packages.
    pause
    exit /b 1
)

echo Build dự án (npm run build)...
npm run build
if errorlevel 1 (
    echo Lỗi khi build dự án.
    pause
    exit /b 1
)

:: Bước 6: Deploy lên server (tùy chọn)
:: Cấu hình SSH để sao chép các file tĩnh sang server. Thay các giá trị dưới bằng thực tế của bạn.
set USERNAME=your_ssh_user
set SERVER=your_server_ip_or_domain
set REMOTE_PATH=/var/www/html/your_site

echo Sao chép các file build lên server %SERVER%...
pscp -r -P 22 build/* %USERNAME%@%SERVER%:%REMOTE_PATH%
if errorlevel 1 (
    echo Lỗi: Sao chép file lên server thất bại.
    pause
    exit /b 1
)

:: Bước 7: Hoàn thành
echo.
echo ==== ĐÃ ĐỈU LÊN SERVER ==== 
echo Kiểm tra trang web hoặc GitHub Actions để xác nhận.
echo.
pause
