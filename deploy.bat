@echo off
chcp 65001 >nul
echo === 한-중 가계부 배포 (Vercel) ===
echo.

echo [1/2] 빌드 중...
call npm run build
if errorlevel 1 (
    echo 빌드 실패.
    pause
    exit /b 1
)

echo.
echo [2/2] Vercel 배포 중... (프로덕션)
call npx vercel --prod
if errorlevel 1 (
    echo 배포 실패.
    pause
    exit /b 1
)

echo.
echo 배포 완료.
pause
