/**
 * Futronic FS80H Fingerprint Scanner Service
 * Supports:
 * 1. Futronic Web API (ftrScanAPI local service running on port 15270)
 * 2. WebUSB direct hardware access (Vendor ID: 0x0835)
 * 3. Fallback High-Fidelity Simulation generator for development/testing
 */

export interface FutronicConfig {
  endpoint: string; // Default: 'http://127.0.0.1:15270/fpoperation'
  invert: boolean;
  lfd: boolean; // Live Finger Detection
  autoCapture: boolean;
}

export const DEFAULT_FUTRONIC_ENDPOINT = 'http://127.0.0.1:15270/fpoperation';
export const FUTRONIC_USB_VENDOR_ID = 0x0835; // Futronic Co., Ltd.
export const FUTRONIC_FS80H_PRODUCT_ID = 0x0800;

export interface ScanResult {
  dataUrl: string;
  width: number;
  height: number;
  rawBytes?: Uint8Array;
  timestamp: string;
  source: 'hardware_http' | 'hardware_webusb' | 'simulation';
}

export type ScannerStatus = 
  | 'idle'
  | 'checking'
  | 'ready'
  | 'waiting_finger'
  | 'capturing'
  | 'success'
  | 'driver_not_found'
  | 'disconnected'
  | 'error';

/**
 * Check if the local Futronic ftrScanAPI Web Server is running
 */
export async function checkFutronicServerStatus(endpoint: string = DEFAULT_FUTRONIC_ENDPOINT): Promise<{
  isOnline: boolean;
  message: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Test ping via simple OPTIONS or POST attempt
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'check' }),
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && (res.status === 200 || res.status === 400 || res.status === 405)) {
      return {
        isOnline: true,
        message: 'พบไดรเวอร์และบริการ Futronic FS80H (ftrScanAPI) พร้อมทำงาน'
      };
    }
  } catch (e) {
    // Network or CORS error
  }

  return {
    isOnline: false,
    message: 'ไม่พบบริการ Futronic Web Service (พอร์ต 15270) กรุณาตรวจสอบว่าเปิดไดรเวอร์แล้ว'
  };
}

/**
 * Connect to Futronic FS80H via WebUSB
 */
export async function requestFutronicWebUSB(): Promise<{
  success: boolean;
  device?: any;
  error?: string;
}> {
  if (!('usb' in navigator)) {
    return {
      success: false,
      error: 'เบราว์เซอร์นี้ไม่รองรับ WebUSB API (แนะนำให้ใช้ Google Chrome หรือ Microsoft Edge)'
    };
  }

  try {
    const device = await (navigator as any).usb.requestDevice({
      filters: [
        { vendorId: FUTRONIC_USB_VENDOR_ID }
      ]
    });

    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    await device.claimInterface(0);

    return {
      success: true,
      device
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'การเชื่อมต่อ WebUSB ถูกยกเลิกหรือล้มเหลว'
    };
  }
}

/**
 * Start a capture operation with the Futronic HTTP Web Server
 */
export async function startHttpCapture(
  endpoint: string = DEFAULT_FUTRONIC_ENDPOINT,
  onStatusChange?: (status: ScannerStatus, label: string) => void,
  invert: boolean = true
): Promise<ScanResult> {
  onStatusChange?.('checking', 'กำลังเชื่อมต่อเครื่องสแกน Futronic FS80H...');

  const payload = {
    operation: 'capture',
    lfd: 'no',
    invert: invert ? 'yes' : 'no'
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Futronic Service error: ${response.statusText}`);
  }

  const opData = await response.json();
  if (opData.status !== 'success') {
    throw new Error(opData.error || 'Failed to initialize capture');
  }

  const opId = opData.id;
  const devWidth = parseInt(opData.devwidth, 10) || 320;
  const devHeight = parseInt(opData.devheight, 10) || 480;

  // Poll operation status until done
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds

    const pollInterval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        // Cancel operation
        fetch(`${endpoint}/${opId}/cancel`, { method: 'PUT' }).catch(() => {});
        reject(new Error('หมดเวลาการสแกน กรุณาลองใหม่อีกครั้ง'));
        return;
      }

      try {
        const stateRes = await fetch(`${endpoint}/${opId}`);
        if (!stateRes.ok) {
          clearInterval(pollInterval);
          reject(new Error('การเชื่อมต่อกับสแกนเนอร์ขาดหาย'));
          return;
        }

        const stateData = await stateRes.json();

        if (stateData.state === 'inprogress') {
          onStatusChange?.('waiting_finger', 'กรุณาวางนิ้วบนเครื่องสแกน Futronic FS80H...');
        } else if (stateData.state === 'done') {
          clearInterval(pollInterval);
          if (stateData.status === 'success') {
            onStatusChange?.('capturing', 'กำลังประมวลผลภาพลายนิ้วมือ...');

            // Fetch raw image bytes
            const imgRes = await fetch(`${endpoint}/${opId}/image`);
            const buffer = await imgRes.arrayBuffer();
            const rawBytes = new Uint8Array(buffer);

            // Convert grayscale raw bytes to Canvas DataURL
            const canvas = document.createElement('canvas');
            canvas.width = devWidth;
            canvas.height = devHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              const imgData = ctx.createImageData(devWidth, devHeight);
              for (let i = 0; i < rawBytes.length; i++) {
                const val = rawBytes[i];
                imgData.data[i * 4] = val;     // R
                imgData.data[i * 4 + 1] = val; // G
                imgData.data[i * 4 + 2] = val; // B
                imgData.data[i * 4 + 3] = 255; // A
              }
              ctx.putImageData(imgData, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

              onStatusChange?.('success', 'สแกนลายนิ้วมือสำเร็จ!');
              resolve({
                dataUrl,
                width: devWidth,
                height: devHeight,
                rawBytes,
                timestamp: new Date().toISOString(),
                source: 'hardware_http'
              });
            } else {
              reject(new Error('Failed to create canvas context'));
            }
          } else {
            reject(new Error('การสแกนล้มเหลว กรุณาวางนิ้วใหม่อีกครั้ง'));
          }
        }
      } catch (err: any) {
        clearInterval(pollInterval);
        reject(err);
      }
    }, 500);
  });
}

/**
 * Generate simulated FS80H Scan Result for testing in preview/demo environments
 */
export function generateSimulatedFS80HScan(
  fingerKey: string = 'L1',
  patternCode: string = 'Wt',
  angleIndex: number = 1
): ScanResult {
  const canvas = document.createElement('canvas');
  const width = 320;
  const height = 480;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  // Draw authentic Futronic optical background (deep dark gray/black with optical texture)
  ctx.fillStyle = '#050709';
  ctx.fillRect(0, 0, width, height);

  // Optical sensor glass highlight & border vignette
  const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, 220);
  grad.addColorStop(0, '#1a222d');
  grad.addColorStop(0.7, '#0a0d12');
  grad.addColorStop(1, '#020305');
  ctx.fillStyle = grad;
  ctx.fillRect(10, 10, width - 20, height - 20);

  // Draw realistic ridge lines
  ctx.strokeStyle = '#d8e2ec';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';

  const centerX = width / 2 + (angleIndex === 2 ? -25 : angleIndex === 3 ? 25 : 0);
  const centerY = height / 2 + 10;

  // Draw fingerprint patterns based on code
  if (patternCode.startsWith('W') || patternCode === 'Wt' || patternCode === 'Ws') {
    // Whorl pattern (concentric ellipses and spirals)
    for (let r = 8; r < 140; r += 5.5) {
      ctx.beginPath();
      const wave = Math.sin(r * 0.2) * 1.5;
      ctx.ellipse(centerX, centerY + wave, r, r * 1.35, (angleIndex - 1) * 0.05, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (patternCode === 'U' || patternCode === 'UL') {
    // Ulnar Loop
    for (let r = 8; r < 140; r += 5.5) {
      ctx.beginPath();
      ctx.arc(centerX + 15, centerY - 20, r, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();
    }
  } else {
    // Arch pattern
    for (let r = 10; r < 140; r += 5.5) {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + (r * 0.6), r * 1.2, r * 0.7, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }
  }

  // Optical noise & ridge texture
  const imgData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    imgData.data[i] = Math.max(0, Math.min(255, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + noise));
    imgData.data[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Add subtle Futronic watermark / scan timestamp
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(116, 185, 255, 0.4)';
  ctx.fillText(`FS80H • 500DPI • ${fingerKey} • A${angleIndex}`, 16, height - 16);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width,
    height,
    timestamp: new Date().toISOString(),
    source: 'simulation'
  };
}
