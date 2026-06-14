@echo off
REM ------------------------------------------------------------
REM  Deploy.bat – Đẩy code lên GitHub và kích hoạt Cloud Run tự động
REM  Đặt trong thư mục gốc của dự án:
REM  C:\Users\Admin\Desktop\shopee\cửa-hàng-afili\Affilishop-main
REM ------------------------------------------------------------

REM 1. Di chuyển vào thư mục dự án (nếu chưa ở đây)
cd /d C:\Users\Admin\Desktop\shopee\cửa-hàng-afili\Affilishop-main

REM 2. Kiểm tra trạng thái git (để xem có thay đổi gì)
git status

REM 3. Thêm toàn bộ thay đổi vào staging area
git add .

REM 4. Tạo commit – bạn có thể sửa dòng dưới đây nếu muốn mô tả chi tiết hơn
git commit -m "Cập nhật code – fetch 3 bảng mới, sửa UI admin"

REM 5. Đẩy lên nhánh main của GitHub
git push origin main

REM 6. Thông báo hoàn thành, mở trang GitHub Actions để xem log
echo.
echo ==== Đã đẩy lên GitHub ====
echo Mở GitHub → Actions để kiểm tra quá trình Deploy.
echo.
pause
