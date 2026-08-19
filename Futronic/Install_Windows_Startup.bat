@echo off
chcp 65001 >nul
title ติดตั้งระบบเปิดเครื่องสแกน Futronic อัตโนมัติเมื่อเปิด Windows
echo ==============================================================================
echo   ติดตั้งระบบเปิดเครื่องสแกน Futronic FS80H อัตโนมัติ (Auto-Startup)
echo ==============================================================================
echo.
echo กำลังตั้งค่าให้ FtrScanHttpServer.exe รันอัตโนมัติทุกครั้งที่เปิดเครื่องคอมพิวเตอร์...
echo.

cd /d "%~dp0"

set "TARGET_EXE=%~dp0FtrScanHttpServer.exe"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\Futronic_Scanner_Auto.lnk"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_EXE%'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 7; $s.Save()"

if exist "%SHORTCUT_PATH%" (
    echo [สำเร็จ] ติดตั้งระบบ Auto-Startup เรียบร้อยแล้ว!
    echo.
    echo นับจากนี้ เมื่อคุณเปิดเครื่องคอมพิวเตอร์ เครื่องสแกน FS80H จะพร้อมใช้งานทันที
    echo โดยไม่ต้องดับเบิลคลิกไฟล์หรือตั้งค่าใดๆ อีก
    echo.
    echo กำลังเปิดเครื่องสแกนสำหรับการใช้งานในครั้งนี้...
    start "" "%TARGET_EXE%"
) else (
    echo [แจ้งเตือน] ไม่สามารถสร้าง Shortcut ในโฟลเดอร์ Startup อัตโนมัติได้
    echo คุณสามารถคัดลอกไฟล์ FtrScanHttpServer.exe ไปวางไว้ที่:
    echo %STARTUP_FOLDER%
)

echo.
echo กดปุ่มใดๆ เพื่อเสร็จสิ้น...
pause >nul
