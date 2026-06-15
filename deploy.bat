@echo off
rem ============================================================
rem  DEPLOY WEB — Affilishop-main
rem  LUU Y: Neu can xu ly anh san pham bang GPU, chay TRUOC:
rem         ..\may-tao-anh-ai\start.bat  (giu cua so mo)
rem ============================================================
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ==== DEPLOY WEB AFFILISHOP ====
echo.
echo Neu ban can tao anh san pham bang RTX 3060:
echo   1. Mo thu muc C:\may-tao-anh-ai
echo   2. Chay CHAY.bat va GIU cua so do mo
echo   3. Quay lai day chay deploy.bat
echo.
pause

rem === Bước 1: Kiểm tra trạng thái Git ===
echo ==== Kiểm tra Git ==== 
git status

rem === Bước 2: Thêm và commit các thay đổi (nếu có) ===
git add .
git commit -m "Auto deploy – cập nhật code" || echo No changes to commit.

rem === Buoc 3: Day len GitHub (bo qua neu bi chan secret) ===
echo ==== Day len GitHub ==== 
git push origin main
if errorlevel 1 (
  echo.
  echo CANH BAO: GitHub tu choi push ^(co the do key GCP trong lich su commit^).
  echo Tiep tuc build va deploy local...
  echo.
)

rem === Bước 4: Cài đặt dependencies ===
if not exist "package.json" (
    echo Không tìm thấy package.json – đây có phải là dự án React không?
    pause
    exit /b 1
)

echo ==== Khoi tao tai nguyen (Supabase bucket - neu co .env) ====
node scripts/createBucket.js

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
