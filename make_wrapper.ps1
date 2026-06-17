$txt = @'
@echo off
"C:\Users\Admin\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" %*
'@
[System.IO.File]::WriteAllText('C:\Users\Admin\gcloud.cmd',$txt,[System.Text.Encoding]::ASCII)
Get-Content -LiteralPath 'C:\Users\Admin\gcloud.cmd' -Raw
where.exe gcloud 2>&1
try { & 'C:\Users\Admin\gcloud.cmd' version } catch { Write-Output 'WRAPPER_EXEC_FAILED' }
