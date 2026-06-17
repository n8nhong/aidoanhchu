@echo off
cd /d "%~dp0"

REM Try to find Git in common locations
set GIT_CMD=git
for %%i in (
  "C:\Program Files\Git\cmd\git.exe"
  "C:\Program Files (x86)\Git\cmd\git.exe"
  "C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd\git.exe"
) do (
  if exist %%i (
    set GIT_CMD=%%i
    goto found_git
  )
)

:found_git
echo.
echo ========================================
echo   DEPLOY WEB AFFILISHOP (Fast Mode)
echo ========================================
echo.
echo Build local + push GitHub, GitHub Actions se deploy tu dong.
echo.

echo ==== npm install ====
call npm install
if errorlevel 1 (
  echo LOI: npm install that bai
  pause
  exit /b 1
)

echo ==== npm run build ====
call npm run build
if errorlevel 1 (
  echo LOI: npm run build that bai
  pause
  exit /b 1
)

echo ==== Git commit + push ====
%GIT_CMD% add .
%GIT_CMD% commit -m "Deploy: %date% %time%"
if errorlevel 1 (
  echo THONG BAO: Khong co file moi de push
) else (
  %GIT_CMD% push origin main
  if errorlevel 1 (
    echo CANH BAO: Git push that bai. Hay kiem tra GitHub login.
    pause
    exit /b 1
  )
)

echo.
echo ✓ Build + Push thanh cong!
echo.
echo GitHub Actions se deploy tu dong trong 5-10 phut...
echo.
echo Kiem tra:
echo Dashboard: https://console.cloud.google.com/run/detail/asia-southeast1/aidoanhchu/revisions?project=hocaimienphi
echo GitHub Actions: https://github.com/n8nhong/aidoanhchu/actions
echo.

pause

pause
exit /b 0
