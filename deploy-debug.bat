@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set LOGFILE=deploy_log.txt
echo. > %LOGFILE%
echo ====== DEPLOY LOG - %date% %time% ====== >> %LOGFILE%

echo.
echo ======================================
echo   DEPLOY WEB AFFILISHOP - DEBUG MODE
echo ======================================
echo.

REM === Step 1: Check .env ===
echo [STEP 1] Kiem tra file .env...
if not exist ".env" (
  echo LOI: Chua co file .env
  echo LOI: Chua co file .env >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: File .env ton tai

findstr /C:"DIEN_ANON_KEY" .env >nul 2>&1
if not errorlevel 1 (
  echo LOI: File .env van con text gia DIEN_ANON_KEY
  echo LOI: File .env van con text gia DIEN_ANON_KEY >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: File .env co key

REM === Step 2: npm install ===
echo.
echo [STEP 2] Chay npm install...
npm install >> %LOGFILE% 2>&1
if errorlevel 1 (
  echo LOI: npm install that bai
  echo LOI: npm install that bai >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: npm install thanh cong

REM === Step 3: npm build ===
echo.
echo [STEP 3] Chay npm run build...
npm run build >> %LOGFILE% 2>&1
if errorlevel 1 (
  echo LOI: npm run build that bai
  echo LOI: npm run build that bai >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: npm run build thanh cong

REM === Step 4: Check gcloud ===
echo.
echo [STEP 4] Kiem tra gcloud CLI...
where gcloud >nul 2>&1
if errorlevel 1 (
  echo LOI: gcloud CLI chua duoc cai dat
  echo LOI: gcloud CLI chua duoc cai dat >> %LOGFILE%
  echo Cai dat: https://cloud.google.com/sdk/docs/install >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: gcloud CLI da cai dat

REM === Step 5: Set project ===
echo.
echo [STEP 5] Set gcloud project...
gcloud config set project hocaimienphi --quiet >> %LOGFILE% 2>&1
if errorlevel 1 (
  echo LOI: Set gcloud project that bai
  echo LOI: Set gcloud project that bai >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: Set project thanh cong

REM === Step 6: Cloud Build submit ===
echo.
echo [STEP 6] Cloud Build submit image...
gcloud builds submit . --tag asia-southeast1-docker.pkg.dev/hocaimienphi/cloud-run-source-deploy/aidoanhchu:latest --project hocaimienphi --region asia-southeast1 --quiet >> %LOGFILE% 2>&1
if errorlevel 1 (
  echo LOI: Cloud Build submit that bai
  echo LOI: Cloud Build submit that bai >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: Cloud Build submit thanh cong

REM === Step 7: Deploy Cloud Run ===
echo.
echo [STEP 7] Deploy Cloud Run...
gcloud run deploy aidoanhchu --image asia-southeast1-docker.pkg.dev/hocaimienphi/cloud-run-source-deploy/aidoanhchu:latest --region asia-southeast1 --platform managed --allow-unauthenticated --project hocaimienphi --quiet >> %LOGFILE% 2>&1
if errorlevel 1 (
  echo LOI: Cloud Run deploy that bai
  echo LOI: Cloud Run deploy that bai >> %LOGFILE%
  echo Hay chay: gcloud auth login >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)
echo OK: Cloud Run deploy thanh cong

REM === Step 8: Get Service URL ===
echo.
echo [STEP 8] Lay URL Cloud Run...
for /f "delims=" %%u in ('gcloud run services describe aidoanhchu --region asia-southeast1 --platform managed --project hocaimienphi --format="value(status.url)" 2^>nul') do set SERVICE_URL=%%u

if "%SERVICE_URL%"=="" (
  echo LOI: Khong the lay URL Cloud Run
  echo LOI: Khong the lay URL Cloud Run >> %LOGFILE%
  type %LOGFILE%
  pause & exit /b 1
)

echo. >> %LOGFILE%
echo ==== DEPLOYED APPLICATION URL ==== >> %LOGFILE%
echo %SERVICE_URL% >> %LOGFILE%
echo ==== CHECK: https://console.cloud.google.com/run/detail/asia-southeast1/aidoanhchu/revisions?project=hocaimienphi ==== >> %LOGFILE%

echo.
echo ==== DEPLOYED APPLICATION URL ====
echo %SERVICE_URL%
echo ==== CHECK: https://console.cloud.google.com/run/detail/asia-southeast1/aidoanhchu/revisions?project=hocaimienphi ====
echo.

echo.
echo ====== LOG FILE CONTENT ======
type %LOGFILE%

pause & exit /b 0
