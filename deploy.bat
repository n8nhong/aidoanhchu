@echo off

:: ------------------------------------------------------------
::  Deploy.bat – Tự động đẩy code lên GitHub và kích hoạt Deploy
::  Đặt trong thư mục gốc của dự án:
::  C:\Users\Admin\Desktop\shopee\cửa-hàng-afili\Affilishop-main
:: ------------------------------------------------------------

:: Bước 1: Di chuyển vào thư mục dự án (nếu chưa ở đây)
cd /d C:\Users\Admin\Desktop\shopee\cửa-hàng-afili\Affilishop-main

:: Bước 2: Kiểm tra trạng thái git (hiển thị các thay đổi chưa được commit)
git status

:: Bước 3: Thêm toàn bộ thay đổi vào staging area
git add .

:: Bước 4: Tạo commit – sửa mô tả ở đây nếu muốn
git commit -m "Auto deploy – cập nhật code"

:: Bước 5: Đẩy lên nhánh main của GitHub
git push origin main

:: Bước 6: Thông báo hoàn thành
echo.
echo ==== ĐÃ ĐỈU LÊN GITHUB ====
echo Mở GitHub → Actions để kiểm tra quá trình Deploy.
echo.
pause
