# 한-중 가계부 배포 스크립트 (Vercel)
# 사용법: PowerShell에서 .\deploy.ps1 또는 .\deploy.ps1 -Preview

param(
    [switch]$Preview  # 있으면 프리뷰 배포, 없으면 프로덕션 배포
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Set-Location $projectRoot

Write-Host "=== 1. 빌드 중... ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "빌드 실패." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== 2. Vercel 배포 중... ===" -ForegroundColor Cyan
if ($Preview) {
    npx vercel
} else {
    npx vercel --prod
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "배포 실패." -ForegroundColor Red
    exit 1
}

Write-Host "`n배포 완료." -ForegroundColor Green
