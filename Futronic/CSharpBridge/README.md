# Futronic FS80H C# Realtime Bridge Service

โปรแกรมบริการเบื้องหลัง (Background Local Bridge) เขียนด้วยภาษา **C# (.NET 8 / .NET 6)** สำหรับเชื่อมต่อกับเครื่องสแกนลายนิ้วมือ **Futronic FS80H Optical Scanner (500 DPI)** และส่งภาพสดแบบ Real-time เข้าสู่ระบบ Web Application ผ่าน HTTP/WebSocket (CORS Enabled)

---

## คุณสมบัติเด่น (Features)
- 🚀 **Real-time Live Stream:** อ่านภาพจาก FS80H อย่างต่อเนื่องความเร็ว ~25-30 FPS ผ่าน `ftrScanAPI.dll`
- 🌐 **Embedded HTTP Server:** มี HTTP Server ในตัว ทำงานบนพอร์ต `15270` และ `8080`
- 🔓 **Full CORS Support:** รองรับการเรียกจาก Web Browser ทุก Domain
- 💡 **LED Control:** ควบคุมไฟเขียว LED (เปิดค้าง, ปิด, Auto สัมผัส)
- 🔄 **Auto-Reconnect:** กู้คืนการเชื่อมต่ออัตโนมัติเมื่อเสียบ/ถอดสาย USB
- ⚡ **Zero External Dependencies:** ใช้เฉพาะ DLL มาตรฐานของ Futronic (`ftrScanAPI.dll`)

---

## โครงสร้างไฟล์
```text
Futronic/
├── CSharpBridge/
│   ├── Program.cs             <- ซอร์สโค้ด C# หลัก
│   ├── FutronicBridge.csproj   <- ไฟล์โปรเจกต์ .NET
│   ├── Build_And_Run.bat      <- ดับเบิลคลิกเพื่อรันทันที
│   ├── Install_Startup.bat    <- ติดตั้งให้รันอัตโนมัติเมื่อเปิด Windows
│   └── README.md
├── ftrScanAPI.dll             <- ไดรเวอร์ของ Futronic
├── ftrMathAPI.dll
└── ftrWSQ.dll
```

---

## วิธีการใช้งาน

### วิธีที่ 1: รันผ่านคำสั่ง (Dotnet CLI)
```bash
cd Futronic/CSharpBridge
dotnet run -c Release
```

### วิธีที่ 2: เปิดด้วย Visual Studio
1. ดับเบิลคลิกเปิดไฟล์ `FutronicBridge.csproj` ด้วย Visual Studio 2022
2. ตรวจสอบว่าคัดลอกไฟล์ `ftrScanAPI.dll` ไว้ในโฟลเดอร์เดียวกับ Output (`bin/Debug` หรือ `bin/Release`)
3. กด **Start (F5)** เพื่อรันโปรแกรม

---

## API Endpoints ที่พร้อมใช้งาน
| Endpoint | Method | คำอธิบาย |
|---|---|---|
| `/preview` | `GET` | ดึงภาพสด Real-time Base64 ล่าสุดพร้อมคะแนนคุณภาพ (Non-blocking) |
| `/capture` หรือ `/fpoperation` | `POST` | คำสั่งสแกนภาพความละเอียดสูง 500 DPI สำหรับบันทึก |
| `/led` | `POST` | สั่งเปิด/ปิดไฟ LED (`{"led": "auto" \| "on" \| "off"}`) |
| `/status` หรือ `/getinfo` | `GET/POST` | ตรวจสอบสถานะการเชื่อมต่อเครื่องสแกน |
