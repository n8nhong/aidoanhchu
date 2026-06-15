@echo off
rem Deploy LOCAL - khong day GitHub, chi build + Cloud Run
cd /d "%~dp0"

echo.
echo ==== DEPLOY LOCAL (bo qua GitHub) ====
echo.

if not exist ".env" (
  echo LOI: Chua co file .env
  echo Hay tao .env va dien Supabase anon key ^(eyJ...^)
  pause
  exit /b 1
)

findstr /C:"DIEN_ANON_KEY" .env >nul 2>&1
if not errorlevel 1 (
  echo.
  echo LOI: File .env chua co key that!
  echo.
  echo Hay mo file .env va thay DIEN_ANON_KEY_CUA_BAN_VAO_DAY
  echo bang key anon tu Supabase:
  echo https://supabase.com/dashboard/project/encpsaatojnxgyjjcvnx/settings/api
  echo.
  pause
  exit /b 1
)

echo ==== Khoi tao Supabase bucket ====
node scripts/createBucket.js

echo ==== npm install ====
call npm install
if errorlevel 1 pause & exit /b 1

echo ==== npm run build ====
call npm run build
if errorlevel 1 pause & exit /b 1

echo ==== Deploy Cloud Run ====
gcloud builds submit --tag gcr.io/hocaimienphi/aidoanhchu
if errorlevel 1 (
  echo LOI gcloud build. Chay: gcloud auth login
  pause
  exit /b 1
)

gcloud run deploy aidoanhchu --image gcr.io/hocaimienphi/aidoanhchu --region asia-southeast1 --platform managed --allow-unauthenticated

echo.
echo ==== XONG ====
pause
