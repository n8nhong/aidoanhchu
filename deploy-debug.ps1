# Deploy Debug Script for Affilishop
# Chạy: Right-click > Run with PowerShell
# Hoặc: powershell -ExecutionPolicy Bypass -File deploy-debug.ps1

$ErrorActionPreference = "Stop"
$LogFile = "deploy_log.txt"

# Clear old log
if (Test-Path $LogFile) { Remove-Item $LogFile }
"" | Out-File $LogFile

function Log {
    param([string]$Message)
    Write-Host $Message
    Add-Content -Path $LogFile -Value $Message
}

function LogError {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
    Add-Content -Path $LogFile -Value "[ERROR] $Message"
}

function LogSuccess {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
    Add-Content -Path $LogFile -Value "[OK] $Message"
}

Log "====== DEPLOY LOG - $(Get-Date) ======"
Log ""

# === Step 1: Check .env ===
Log "[STEP 1] Kiem tra file .env..."
if (-not (Test-Path ".env")) {
    LogError "LOI: Chua co file .env"
    Read-Host "Nhan Enter de thoat"
    exit 1
}
LogSuccess "File .env ton tai"

# Check for dummy key
$envContent = Get-Content ".env" -Raw
if ($envContent -contains "DIEN_ANON_KEY") {
    LogError "LOI: File .env van con placeholder. Hay dien key that!"
    Read-Host "Nhan Enter de thoat"
    exit 1
}
LogSuccess "File .env co key"

# === Step 2: npm install ===
Log ""
Log "[STEP 2] Chay npm install..."
try {
    npm install 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "npm install that bai" }
    LogSuccess "npm install thanh cong"
} catch {
    LogError $_.Exception.Message
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# === Step 3: npm build ===
Log ""
Log "[STEP 3] Chay npm run build..."
try {
    npm run build 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "npm run build that bai" }
    LogSuccess "npm run build thanh cong"
} catch {
    LogError $_.Exception.Message
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# === Step 4: Check gcloud ===
Log ""
Log "[STEP 4] Kiem tra gcloud CLI..."
try {
    $gcloudPath = (Get-Command gcloud -ErrorAction Stop).Source
    LogSuccess "gcloud CLI da cai dat: $gcloudPath"
} catch {
    LogError "LOI: gcloud CLI chua duoc cai dat"
    Add-Content -Path $LogFile -Value "Cai dat tai: https://cloud.google.com/sdk/docs/install"
    Log "Cai dat tai: https://cloud.google.com/sdk/docs/install"
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# === Step 5: Set project ===
Log ""
Log "[STEP 5] Set gcloud project..."
try {
    gcloud config set project hocaimienphi --quiet 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Set gcloud project that bai" }
    LogSuccess "Set project thanh cong"
} catch {
    LogError $_.Exception.Message
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# === Step 6: Cloud Build submit ===
Log ""
Log "[STEP 6] Cloud Build submit image..."
Log "Dieu nay co the mat 5-10 phut..."
try {
    gcloud builds submit . `
        --tag asia-southeast1-docker.pkg.dev/hocaimienphi/cloud-run-source-deploy/aidoanhchu:latest `
        --project hocaimienphi `
        --region asia-southeast1 `
        --quiet 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Cloud Build submit that bai" }
    LogSuccess "Cloud Build submit thanh cong"
} catch {
    LogError $_.Exception.Message
    Add-Content -Path $LogFile -Value "CHECK LOG: https://console.cloud.google.com/cloud-build"
    Log ""
    Log "Chi tiet: https://console.cloud.google.com/cloud-build"
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# === Step 7: Deploy Cloud Run ===
Log ""
Log "[STEP 7] Deploy Cloud Run..."
try {
    gcloud run deploy aidoanhchu `
        --image asia-southeast1-docker.pkg.dev/hocaimienphi/cloud-run-source-deploy/aidoanhchu:latest `
        --region asia-southeast1 `
        --platform managed `
        --allow-unauthenticated `
        --project hocaimienphi `
        --quiet 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "Cloud Run deploy that bai" }
    LogSuccess "Cloud Run deploy thanh cong"
} catch {
    LogError $_.Exception.Message
    Add-Content -Path $LogFile -Value "Hay chay: gcloud auth login"
    Log "Hay chay: gcloud auth login"
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# === Step 8: Get Service URL ===
Log ""
Log "[STEP 8] Lay URL Cloud Run..."
try {
    $serviceUrl = gcloud run services describe aidoanhchu `
        --region asia-southeast1 `
        --platform managed `
        --project hocaimienphi `
        --format="value(status.url)" 2>&1
    
    if ([string]::IsNullOrWhiteSpace($serviceUrl)) {
        throw "Khong the lay URL Cloud Run"
    }
    
    LogSuccess "Lay URL thanh cong: $serviceUrl"
} catch {
    LogError $_.Exception.Message
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# === Success ===
Log ""
Log "====== DEPLOYED APPLICATION URL ======"
Log $serviceUrl
Log "====== CHECK: https://console.cloud.google.com/run/detail/asia-southeast1/aidoanhchu/revisions?project=hocaimienphi ======"
Log ""

# Show full log
Log ""
Log "====== TAT CA LOG ======"
Get-Content $LogFile | ForEach-Object { Log $_ }

Read-Host "Nhan Enter de thoat"
