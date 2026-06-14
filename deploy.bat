@echo off
rem ------------------------------------------------------------
rem Deploy.bat – Tự động đẩy code lên GitHub, build dự án React và deploy
rem Đặt trong thư mục gốc của dự án: Affilishop-main
rem ------------------------------------------------------------

rem Định vị thư mục script để tránh lỗi đường dẫn
cd /d "%~dp0"

rem === Bước 1: Kiểm tra trạng thái Git ===
echo ==== Kiểm tra Git ==== 
git status

rem === Bước 2: Thêm và commit các thay đổi (nếu có) ===
git add .
git commit -m "Auto deploy – cập nhật code" || echo No changes to commit.

rem === Bước 3: Đẩy lên GitHub ===
echo ==== Đẩy lên GitHub ==== 
git push origin main

rem === Bước 4: Cài đặt dependencies ===
if not exist "package.json" (
    echo Không tìm thấy package.json – đây có phải là dự án React không?
    pause
    exit /b 1
)

echo ==== Cài đặt dependencies (npm install) ==== 
npm install
if errorlevel 1 (
    echo Lỗi khi cài npm packages.
    pause
    exit /b 1
)

rem === Bước 5: Build dự án React ===
echo ==== Build dự án (npm run build) ==== 
npm run build
if errorlevel 1 (
    echo Lỗi khi build dự án.
    pause
    exit /b 1
)

rem === Bước 6: Đẩy Docker image lên Google Container Registry ===
rem Cần cài đặt Google Cloud SDK và đăng nhập (gcloud auth login)
gcloud builds submit --tag gcr.io/hocaimienphi/aidoanhchu

rem === Bước 7: Deploy Cloud Run ===
rem Triển khai dịch vụ aidoanhchu trên Cloud Run (khu vực asia-southeast1)
gcloud run deploy aidoanhchu --image gcr.io/hocaimienphi/aidoanhchu --region asia-southeast1 --platform managed --allow-unauthenticated

rem === Hoàn thành ===
echo.
echo ==== ĐÃ ĐỈU LÊN CLOUD RUN ==== 
echo Kiểm tra dịch vụ tại https://aidoanhchu-xxxx-asia-southeast1.run.app (hoặc URL Cloud Run).
echo.
pause
