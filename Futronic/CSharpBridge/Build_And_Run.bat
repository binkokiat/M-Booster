@echo off
chcp 65001 >nul
title รันระบบ Futronic FS80H C# Bridge Service
echo ==============================================================================
echo   คอมไพล์และรันระบบ Futronic FS80H C# Bridge Service (พอร์ต 15270)
echo ==============================================================================
echo.

cd /d "%~dp0"

REM ตรวจสอบว่ามี dotnet CLI หรือไม่
where dotnet >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [1/2] กำลัง Build และ Run โปรเจกต์ C#...
    dotnet run -c Release
) else (
    echo [แจ้งเตือน] ไม่พบคำสั่ง dotnet ในระบบ
    echo กำลังตรวจสอบไฟล์ Executable...
    if exist "bin\Release\net8.0-windows\FutronicCSharpBridge.exe" (
        start "" "bin\Release\net8.0-windows\FutronicCSharpBridge.exe"
    ) else (
        echo กรุณาเปิดโปรเจกต์ FutronicBridge.csproj ด้วย Visual Studio แล้วกด Start (F5)
    )
)

pause
