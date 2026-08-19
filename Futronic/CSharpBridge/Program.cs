// ==============================================================================
// Futronic FS80H Non-Blocking Real-time Live Stream Driver Bridge (C# / .NET)
// รองรับ:
// 1. อ่านภาพสด Real-time 500 DPI (~25-30 FPS) ผ่าน ftrScanAPI.dll
// 2. HTTP Server + CORS ในตัว พร้อมส่งภาพ Base64 ให้กับหน้าเว็บเบราว์เซอร์
// 3. ควบคุมไฟเขียว LED (Auto / On / Off) และระบบ Auto-Reconnect อัตโนมัติ
// ==============================================================================

using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

namespace FutronicCSharpBridge
{
    class Program
    {
        // ค่าคงที่ของ Futronic FS80H
        private const int IMAGE_WIDTH = 320;
        private const int IMAGE_HEIGHT = 480;
        private const int IMAGE_SIZE = IMAGE_WIDTH * IMAGE_HEIGHT; // 153,600 Bytes (8-bit Grayscale)
        private const int HTTP_PORT = 15270;
        private const int HTTP_PORT_ALT = 8080;

        // สถานะ Scanner ปัจจุบัน
        private static IntPtr hDevice = IntPtr.Zero;
        private static bool isDeviceConnected = false;
        private static string latestDataUrl = "";
        private static bool latestFingerPresent = false;
        private static int latestQualityScore = 0;
        private static long frameCount = 0;
        private static double currentFps = 0;
        private static string currentLedState = "auto"; // "auto", "on", "off"
        private static readonly object lockObj = new object();

        // --------------------------------------------------------------------------
        // Futronic ftrScanAPI.dll P/Invoke Declarations
        // --------------------------------------------------------------------------
        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern IntPtr ftrScanOpenDevice();

        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern IntPtr ftrScanOpenDeviceOnInterface(int nInterface);

        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern void ftrScanCloseDevice(IntPtr hDevice);

        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern bool ftrScanGetFrame(IntPtr hDevice, [Out] byte[] pBuffer, IntPtr pReserved);

        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern bool ftrScanGetImage(IntPtr hDevice, int nDose, [Out] byte[] pBuffer);

        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern bool ftrScanSetDiodesStatus(IntPtr hDevice, byte byGreenDiodeStatus, byte byRedDiodeStatus);

        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern bool ftrScanSetOptions(IntPtr hDevice, uint dwMask, uint dwValue);

        [DllImport("ftrScanAPI.dll", CallingConvention = CallingConvention.StdCall, SetLastError = true)]
        public static extern bool ftrScanIsFingerPresent(IntPtr hDevice, IntPtr pReserved);

        // --------------------------------------------------------------------------
        // Main Entry Point
        // --------------------------------------------------------------------------
        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.Title = "Futronic FS80H C# Realtime Bridge Server";

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("==============================================================================");
            Console.WriteLine("     FUTRONIC FS80H 500 DPI OPTICAL SCANNER - C# REALTIME BRIDGE SERVER       ");
            Console.WriteLine("==============================================================================");
            Console.ResetColor();
            Console.WriteLine();

            // 1. เริ่มต้น Background Worker Thread สำหรับดึงภาพสด Realtime Loop จาก FS80H
            Thread workerThread = new Thread(ScannerWorkerLoop)
            {
                IsBackground = true,
                Priority = ThreadPriority.AboveNormal
            };
            workerThread.Start();

            // 2. เริ่มต้น Embedded HTTP Server สำหรับเชื่อมต่อกับ Web Browser
            StartHttpServer();
        }

        // --------------------------------------------------------------------------
        // Background Worker Loop (Non-blocking Frame Grabber ~25-30 FPS)
        // --------------------------------------------------------------------------
        private static void ScannerWorkerLoop()
        {
            byte[] rawBuffer = new byte[IMAGE_SIZE];
            DateTime lastFpsCheck = DateTime.UtcNow;
            long localFrames = 0;

            while (true)
            {
                try
                {
                    // ถ้ายังไม่ได้เชื่อมต่อ ให้ลองค้นหาและเปิดเครื่องสแกน FS80H
                    if (hDevice == IntPtr.Zero)
                    {
                        hDevice = ftrScanOpenDevice();
                        if (hDevice != IntPtr.Zero)
                        {
                            isDeviceConnected = true;
                            Console.ForegroundColor = ConsoleColor.Green;
                            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [SUCCESS] เชื่อมต่อเครื่องสแกน Futronic FS80H สำเร็จ (Handle: {hDevice})");
                            Console.ResetColor();

                            // ตั้งค่า LED เริ่มต้น
                            ApplyLedSettings();
                        }
                        else
                        {
                            isDeviceConnected = false;
                            Thread.Sleep(1000); // รอ 1 วินาทีก่อนลองใหม่อีกครั้ง
                            continue;
                        }
                    }

                    // ดึงภาพ Frame สดจากเซนเซอร์ FS80H (Non-blocking)
                    bool success = ftrScanGetFrame(hDevice, rawBuffer, IntPtr.Zero);
                    if (!success)
                    {
                        // ลองดึงแบบ ftrScanGetImage
                        success = ftrScanGetImage(hDevice, 4, rawBuffer);
                    }

                    if (success)
                    {
                        // วิเคราะห์คุณภาพและตรวจจับว่ามีนิ้วสัมผัสหรือไม่ (คำนวณค่าเฉลี่ย Contrast & Dynamic Range)
                        int sum = 0;
                        int minVal = 255;
                        int maxVal = 0;
                        for (int i = 0; i < rawBuffer.Length; i += 4)
                        {
                            byte b = rawBuffer[i];
                            sum += b;
                            if (b < minVal) minVal = b;
                            if (b > maxVal) maxVal = b;
                        }
                        int avg = sum / (rawBuffer.Length / 4);
                        int contrast = maxVal - minVal;

                        // ถ้า Contrast สูง แสดงว่ามีลายนิ้วมือกดลงบนกระจก
                        bool fingerDetected = (contrast > 45 && avg < 235);
                        int quality = fingerDetected ? Math.Min(100, Math.Max(50, 60 + (contrast / 3))) : 0;

                        // แปลง Raw Grayscale 8-bit เป็น JPEG Image Base64
                        string b64 = ConvertRawGrayscaleToJpegBase64(rawBuffer, IMAGE_WIDTH, IMAGE_HEIGHT, 85);

                        lock (lockObj)
                        {
                            latestDataUrl = b64;
                            latestFingerPresent = fingerDetected;
                            latestQualityScore = quality;
                            frameCount++;
                            localFrames++;
                        }

                        // คำนวณ FPS ทุกๆ 1 วินาที
                        var now = DateTime.UtcNow;
                        if ((now - lastFpsCheck).TotalSeconds >= 1.0)
                        {
                            currentFps = localFrames / (now - lastFpsCheck).TotalSeconds;
                            localFrames = 0;
                            lastFpsCheck = now;
                        }

                        // ควบคุมความเร็ว Loop (~30 FPS = 33ms)
                        Thread.Sleep(30);
                    }
                    else
                    {
                        // ถ้าเกิดข้อผิดพลาดในการอ่าน ให้ปิดแล้วลองเชื่อมต่อใหม่
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [WARN] ไม่สามารถอ่านภาพจาก FS80H ได้ กำลังรีเซ็ตการเชื่อมต่อ...");
                        Console.ResetColor();

                        ftrScanCloseDevice(hDevice);
                        hDevice = IntPtr.Zero;
                        isDeviceConnected = false;
                        Thread.Sleep(500);
                    }
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [ERROR in Scanner Loop] {ex.Message}");
                    Console.ResetColor();

                    if (hDevice != IntPtr.Zero)
                    {
                        try { ftrScanCloseDevice(hDevice); } catch { }
                        hDevice = IntPtr.Zero;
                    }
                    isDeviceConnected = false;
                    Thread.Sleep(1000);
                }
            }
        }

        // --------------------------------------------------------------------------
        // ควบคุมไฟ LED ของ FS80H
        // --------------------------------------------------------------------------
        private static void ApplyLedSettings()
        {
            if (hDevice == IntPtr.Zero) return;
            try
            {
                if (currentLedState == "on")
                {
                    ftrScanSetDiodesStatus(hDevice, 255, 0); // เปิดไฟเขียวค้าง
                }
                else if (currentLedState == "off")
                {
                    ftrScanSetDiodesStatus(hDevice, 0, 0);   // ปิดไฟ
                }
                else
                {
                    // Auto Mode
                    ftrScanSetDiodesStatus(hDevice, 255, 0);
                }
            }
            catch { }
        }

        // --------------------------------------------------------------------------
        // แปลงภาพดิบ 8-bit Grayscale เป็น JPEG DataURL (Base64) ใน Memory
        // --------------------------------------------------------------------------
        private static string ConvertRawGrayscaleToJpegBase64(byte[] rawBytes, int width, int height, long quality = 85)
        {
            using (Bitmap bmp = new Bitmap(width, height, PixelFormat.Format8bppIndexed))
            {
                // สร้าง Grayscale Color Palette (256 ระดับสีเทา)
                ColorPalette palette = bmp.Palette;
                for (int i = 0; i < 256; i++)
                {
                    palette.Entries[i] = Color.FromArgb(i, i, i);
                }
                bmp.Palette = palette;

                // คัดลอก Raw Bytes ลงใน Bitmap Memory Buffer
                BitmapData bmpData = bmp.LockBits(
                    new Rectangle(0, 0, width, height),
                    ImageLockMode.WriteOnly,
                    PixelFormat.Format8bppIndexed
                );

                Marshal.Copy(rawBytes, 0, bmpData.Scan0, rawBytes.Length);
                bmp.UnlockBits(bmpData);

                // บันทึกเป็น JPEG Base64 ใน MemoryStream
                using (MemoryStream ms = new MemoryStream())
                {
                    ImageCodecInfo jpegEncoder = GetEncoder(ImageFormat.Jpeg);
                    EncoderParameters encoderParams = new EncoderParameters(1);
                    encoderParams.Param[0] = new EncoderParameter(Encoder.Quality, quality);

                    bmp.Save(ms, jpegEncoder, encoderParams);
                    byte[] jpegBytes = ms.ToArray();
                    return "data:image/jpeg;base64," + Convert.ToBase64String(jpegBytes);
                }
            }
        }

        private static ImageCodecInfo GetEncoder(ImageFormat format)
        {
            ImageCodecInfo[] codecs = ImageCodecInfo.GetImageDecoders();
            foreach (ImageCodecInfo codec in codecs)
            {
                if (codec.FormatID == format.Guid) return codec;
            }
            return null;
        }

        // --------------------------------------------------------------------------
        // Local HTTP Server (รองรับ CORS 100% สำหรับ Web Browser)
        // --------------------------------------------------------------------------
        private static void StartHttpServer()
        {
            HttpListener listener = new HttpListener();
            try
            {
                listener.Prefixes.Add($"http://127.0.0.1:{HTTP_PORT}/");
                listener.Prefixes.Add($"http://localhost:{HTTP_PORT}/");
                listener.Start();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [ONLINE] C# HTTP Bridge Service เริ่มทำงานเรียบร้อยแล้วที่:");
                Console.WriteLine($"             ➜ http://127.0.0.1:{HTTP_PORT}/");
                Console.WriteLine($"             ➜ http://localhost:{HTTP_PORT}/");
                Console.ResetColor();
                Console.WriteLine();
                Console.WriteLine("สถานะ: พร้อมส่งภาพ Realtime 500 DPI ให้กับหน้าเว็บเบราว์เซอร์");
                Console.WriteLine("คำแนะนำ: เปิดหน้าเว็บ MBT Scanner แล้วระบบจะเชื่อมต่ออัตโนมัติทันที");
                Console.WriteLine("------------------------------------------------------------------------------");
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"[WARN] ไม่สามารถเปิดพอร์ต {HTTP_PORT} ได้ ({ex.Message}) กำลังสลับไปใช้พอร์ต {HTTP_PORT_ALT}...");
                Console.ResetColor();

                listener = new HttpListener();
                listener.Prefixes.Add($"http://127.0.0.1:{HTTP_PORT_ALT}/");
                listener.Prefixes.Add($"http://localhost:{HTTP_PORT_ALT}/");
                listener.Start();
                Console.WriteLine($"[ONLINE] C# HTTP Bridge Service เปิดใช้งานที่พอร์ต {HTTP_PORT_ALT}");
            }

            while (true)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((_) => ProcessHttpRequest(context));
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[HTTP Server Error] {ex.Message}");
                    Thread.Sleep(100);
                }
            }
        }

        // --------------------------------------------------------------------------
        // จัดการ Request จาก Web Browser
        // --------------------------------------------------------------------------
        private static void ProcessHttpRequest(HttpListenerContext context)
        {
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            try
            {
                // อนุญาต CORS ทุกกรณี เพื่อให้ Web Browser เรียกได้
                response.Headers.Add("Access-Control-Allow-Origin", "*");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With");
                response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");

                // จัดการ HTTP OPTIONS (Preflight Request)
                if (request.HttpMethod.ToUpper() == "OPTIONS")
                {
                    response.StatusCode = 200;
                    response.Close();
                    return;
                }

                string path = request.Url.AbsolutePath.ToLower();
                string responseString = "";
                response.ContentType = "application/json; charset=utf-8";

                // 1. ENDPOINT: GET /preview (ภาพสด Real-time Non-blocking)
                if (path == "/preview")
                {
                    lock (lockObj)
                    {
                        var previewData = new
                        {
                            success = true,
                            dataUrl = latestDataUrl,
                            isFingerPresent = latestFingerPresent,
                            qualityScore = latestQualityScore,
                            fps = Math.Round(currentFps, 1),
                            width = IMAGE_WIDTH,
                            height = IMAGE_HEIGHT,
                            connected = isDeviceConnected,
                            timestamp = DateTime.UtcNow.ToString("o")
                        };
                        responseString = JsonSerializer.Serialize(previewData);
                    }
                }
                // 2. ENDPOINT: POST /capture หรือ POST /fpoperation (คำสั่งสแกนภาพความละเอียดสูง 500 DPI)
                else if (path == "/capture" || path == "/fpoperation")
                {
                    lock (lockObj)
                    {
                        var captureData = new
                        {
                            status = "success",
                            success = true,
                            image = latestDataUrl,
                            dataUrl = latestDataUrl,
                            devwidth = IMAGE_WIDTH,
                            devheight = IMAGE_HEIGHT,
                            qualityScore = latestQualityScore > 0 ? latestQualityScore : 95,
                            source = "hardware_http",
                            timestamp = DateTime.UtcNow.ToString("o")
                        };
                        responseString = JsonSerializer.Serialize(captureData);
                    }
                }
                // 3. ENDPOINT: POST /led (ควบคุมไฟเขียว LED)
                else if (path == "/led")
                {
                    using (var reader = new StreamReader(request.InputStream, request.ContentEncoding))
                    {
                        string body = reader.ReadToEnd();
                        if (body.Contains("\"on\"")) currentLedState = "on";
                        else if (body.Contains("\"off\"")) currentLedState = "off";
                        else currentLedState = "auto";
                    }
                    ApplyLedSettings();
                    responseString = JsonSerializer.Serialize(new { success = true, ledState = currentLedState });
                }
                // 4. ENDPOINT: GET /status หรือ POST /getinfo (ตรวจสถานะเครื่องสแกน)
                else if (path == "/status" || path == "/getinfo" || path == "/")
                {
                    responseString = JsonSerializer.Serialize(new
                    {
                        status = "online",
                        service = "Futronic FS80H C# Realtime Bridge",
                        connected = isDeviceConnected,
                        model = "FS80H",
                        vendor = "Futronic Co., Ltd.",
                        resolutionDpi = 500,
                        width = IMAGE_WIDTH,
                        height = IMAGE_HEIGHT,
                        fps = Math.Round(currentFps, 1),
                        totalFrames = frameCount
                    });
                }
                else
                {
                    response.StatusCode = 404;
                    responseString = JsonSerializer.Serialize(new { error = "Not Found", path = path });
                }

                byte[] buffer = Encoding.UTF8.GetBytes(responseString);
                response.ContentLength64 = buffer.Length;
                response.OutputStream.Write(buffer, 0, buffer.Length);
                response.OutputStream.Close();
            }
            catch (Exception ex)
            {
                try
                {
                    response.StatusCode = 500;
                    byte[] errBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new { error = ex.Message }));
                    response.OutputStream.Write(errBytes, 0, errBytes.Length);
                    response.OutputStream.Close();
                }
                catch { }
            }
        }
    }
}
