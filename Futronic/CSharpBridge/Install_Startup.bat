@echo off
chcp 65001 >nul
title ติดตั้ง C# Bridge ให้เปิดอัตโนมัติเมื่อเปิด Windows
echo ==============================================================================
echo   ติดตั้ง Futronic FS80H C# Bridge ให้ทำงานอัตโนมัติ (Auto-Startup)
echo ==============================================================================
echo.

cd /d "%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\Futronic_CSharp_Bridge.lnk"
set "TARGET_CMD=%~dp0Build_And_Run.bat"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_CMD%'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 7; $s.Save()"

if exist "%SHORTCUT_PATH%" (
    echo [สำเร็จ] เพิ่ม Shortcut ลงในโฟลเดอร์ Windows Startup เรียบร้อยแล้ว!
    echo ต่อไปนี้เมื่อเปิดคอมพิวเตอร์ โปรแกรม C# Bridge จะรันในพื้นหลังอัตโนมัติ
) else (
    echo [แจ้งเตือน] ไม่สามารถสร้าง Shortcut ได้ กรุณาคัดลอกไฟล์ Build_And_Run.bat ไปไว้ที่:
    echo %STARTUP_FOLDER%
)

echo.
pause
