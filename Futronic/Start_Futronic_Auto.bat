@echo off
chcp 65001 >nul
title Futronic FS80H Local Scanner Service
echo ==============================================================================
echo   Futronic FS80H Scanner Local Service (Port 15270)
echo   ระบบเชื่อมต่อเครื่องสแกนลายนิ้วมือ Futronic อัตโนมัติ
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [*] กำลังเริ่มทำงาน FtrScanHttpServer.exe ...
start "" "%~dp0FtrScanHttpServer.exe"

echo [OK] เซิร์ฟเวอร์เครื่องสแกนเปิดทำงานเรียบร้อยแล้วที่พอร์ต 15270
echo [*] ท่านสามารถใช้งานโปรแกรมสแกนลายนิ้วมือบนเบราว์เซอร์ได้ทันที
echo.
timeout /t 3 >nul
exit
