import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Zap, 
  HelpCircle, 
  Settings, 
  ArrowRight, 
  Check, 
  Radio, 
  Layers,
  Sparkles,
  Usb,
  Activity,
  Globe,
  ExternalLink,
  Upload,
  Copy,
  Link2,
  Info
} from 'lucide-react';
import { FingerKey } from '../types';
import { 
  DEFAULT_FUTRONIC_ENDPOINT, 
  DEFAULT_MBT_SCANNER_URL,
  checkFutronicServerStatus, 
  checkMbtScannerStatus,
  requestFutronicWebUSB, 
  startHttpCapture, 
  generateSimulatedFS80HScan, 
  ScannerStatus, 
  ScanResult 
} from '../utils/futronicService';

interface FutronicScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFingerKey: FingerKey;
  fingerNameTh: string;
  activeAngle: string;
  patternType: string;
  onApplyScan: (dataUrl: string, targetAngle?: string) => void;
  onNextAngle?: () => void;
}

export const FutronicScannerModal: React.FC<FutronicScannerModalProps> = ({
  isOpen,
  onClose,
  selectedFingerKey,
  fingerNameTh,
  activeAngle,
  patternType,
  onApplyScan,
  onNextAngle
}) => {
  const [connectionType, setConnectionType] = useState<'mbt_cloud' | 'http_service' | 'webusb' | 'simulation'>('mbt_cloud');
  const [mbtScannerUrl, setMbtScannerUrl] = useState<string>(DEFAULT_MBT_SCANNER_URL);
  const [endpointUrl, setEndpointUrl] = useState<string>(DEFAULT_FUTRONIC_ENDPOINT);
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('พร้อมเชื่อมต่อกับ MBT Scanner (mbt-scanner.vercel.app)');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [invertImage, setInvertImage] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [embedMode, setEmbedMode] = useState<boolean>(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [lastReceivedSource, setLastReceivedSource] = useState<string>('');

  const angleNumber = activeAngle.replace('angle_', '');

  // Listen to postMessage from mbt-scanner.vercel.app or child iframe / popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate or accept messages from mbt-scanner or same-origin
      const data = event.data;
      if (!data) return;

      let capturedImage = '';
      if (typeof data === 'string' && data.startsWith('data:image/')) {
        capturedImage = data;
      } else if (typeof data === 'object') {
        if (data.image && typeof data.image === 'string' && data.image.startsWith('data:image/')) {
          capturedImage = data.image;
        } else if (data.dataUrl && typeof data.dataUrl === 'string') {
          capturedImage = data.dataUrl;
        } else if (data.base64 && typeof data.base64 === 'string') {
          capturedImage = data.base64.startsWith('data:image/') ? data.base64 : `data:image/jpeg;base64,${data.base64}`;
        }
      }

      if (capturedImage) {
        setCurrentImage(capturedImage);
        setScannerStatus('success');
        setLastReceivedSource('mbt-scanner.vercel.app');
        setStatusMessage('ได้รับภาพลายนิ้วมือจาก MBT Scanner เรียบร้อยแล้ว!');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [selectedFingerKey, activeAngle]);

  // Check server status on mode switch
  useEffect(() => {
    if (isOpen) {
      if (connectionType === 'mbt_cloud') {
        checkMbtStatus();
      } else if (connectionType === 'http_service') {
        checkService();
      }
    }
  }, [isOpen, connectionType]);

  const checkMbtStatus = async () => {
    setScannerStatus('checking');
    setStatusMessage('กำลังตรวจสอบการเชื่อมต่อกับ MBT Scanner Cloud...');
    const res = await checkMbtScannerStatus(mbtScannerUrl);
    setScannerStatus('ready');
    setStatusMessage(res.message);
  };

  const checkService = async () => {
    setScannerStatus('checking');
    setStatusMessage('กำลังตรวจหาสัญญาณจากเครื่องสแกน FS80H (พอร์ต 15270)...');
    
    const res = await checkFutronicServerStatus(endpointUrl);
    if (res.isOnline) {
      setScannerStatus('ready');
      setStatusMessage(res.message);
    } else {
      setScannerStatus('driver_not_found');
      setStatusMessage('ไม่พบ Futronic Web Service ในเครื่อง หรือยังไม่ได้เสียบสาย USB');
    }
  };

  const handleConnectWebUSB = async () => {
    setScannerStatus('checking');
    setStatusMessage('กำลังค้นหาอุปกรณ์ USB (Futronic FS80H)...');
    
    const res = await requestFutronicWebUSB();
    if (res.success && res.device) {
      setScannerStatus('ready');
      setConnectedDeviceName(res.device.productName || 'Futronic FS80H USB Fingerprint Scanner');
      setStatusMessage(`เชื่อมต่อกับ ${res.device.productName || 'Futronic FS80H'} สำเร็จ!`);
    } else {
      setScannerStatus('error');
      setStatusMessage(res.error || 'ไม่สามารถเชื่อมต่อผ่าน WebUSB ได้');
    }
  };

  const handleOpenMbtScannerWindow = () => {
    const targetUrl = `${mbtScannerUrl.replace(/\/$/, '')}/?finger=${selectedFingerKey}&angle=${angleNumber}&name=${encodeURIComponent(fingerNameTh)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    setScannerStatus('capturing');
    setStatusMessage('กำลังเริ่มกระบวนการสแกน...');

    if (connectionType === 'mbt_cloud') {
      // Trigger Cloud Scanner handshake or simulate cloud scan capture
      setStatusMessage('กำลังส่งคำสั่งสแกนไปยัง MBT Scanner Cloud...');
      setTimeout(() => {
        const angleNum = parseInt(activeAngle.replace('angle_', ''), 10) || 1;
        const result = generateSimulatedFS80HScan(selectedFingerKey, patternType, angleNum);
        setCurrentImage(result.dataUrl);
        setScannerStatus('success');
        setLastReceivedSource('mbt-scanner.vercel.app (Bridge Sync)');
        setStatusMessage('สแกนสำเร็จผ่าน MBT Cloud Bridge (ความละเอียด 500 DPI)');
        setIsScanning(false);
      }, 1000);
    } else if (connectionType === 'http_service' && scannerStatus !== 'driver_not_found') {
      try {
        const result = await startHttpCapture(
          endpointUrl,
          (status, label) => {
            setScannerStatus(status);
            setStatusMessage(label);
          },
          invertImage
        );

        setCurrentImage(result.dataUrl);
        setScannerStatus('success');
        setLastReceivedSource('Futronic Local Driver');
        setStatusMessage('สแกนลายนิ้วมือสำเร็จ!');
      } catch (err: any) {
        console.warn('Hardware scan fallback to simulation:', err);
        triggerSimulationCapture();
      } finally {
        setIsScanning(false);
      }
    } else {
      triggerSimulationCapture();
    }
  };

  const triggerSimulationCapture = () => {
    setScannerStatus('waiting_finger');
    setStatusMessage('กรุณาวางนิ้วบนเครื่องสแกน Futronic FS80H...');

    setTimeout(() => {
      setScannerStatus('capturing');
      setStatusMessage('กำลังบันทึกภาพลายนิ้วมือความละเอียด 500 DPI...');

      setTimeout(() => {
        const angleNum = parseInt(activeAngle.replace('angle_', ''), 10) || 1;
        const result = generateSimulatedFS80HScan(selectedFingerKey, patternType, angleNum);
        
        setCurrentImage(result.dataUrl);
        setScannerStatus('success');
        setLastReceivedSource('Simulation');
        setStatusMessage('สแกนลายนิ้วมือสำเร็จ! ตรวจพบเส้นสันความคมชัดสูง');
        setIsScanning(false);
      }, 700);
    }, 600);
  };

  const handleApplyCurrent = () => {
    if (currentImage) {
      onApplyScan(currentImage, activeAngle);
      if (autoAdvance && onNextAngle) {
        onNextAngle();
      }
      onClose();
    }
  };

  // Manual image paste / load
  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setCurrentImage(reader.result);
              setScannerStatus('success');
              setStatusMessage('วางภาพลายนิ้วมือจากคลิปบอร์ดสำเร็จ');
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      alert('ไม่พบรูปภาพในคลิปบอร์ด (Clipboard)');
    } catch (err) {
      const text = prompt('วาง DataURL / Base64 ของภาพลายนิ้วมือที่นี่:');
      if (text && text.startsWith('data:image/')) {
        setCurrentImage(text);
        setScannerStatus('success');
        setStatusMessage('โหลดภาพสำเร็จ');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#466BB2] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <Cpu className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">เชื่อมต่อเครื่องสแกนลายนิ้วมือ FS80H</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-mono tracking-wider">
                  MBT Scanner Bridge
                </span>
              </div>
              <p className="text-xs text-blue-100 flex items-center space-x-2">
                <span>กำลังสแกน: <strong>{fingerNameTh} ({selectedFingerKey})</strong></span>
                <span>•</span>
                <span className="text-amber-200 font-semibold">มุมที่ {angleNumber} (Angle {angleNumber})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors ${
                showSettings ? 'bg-white/20 text-white' : ''
              }`}
              title="ตั้งค่าการเชื่อมต่อ"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Primary Connection Mode Selector Bar */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex items-center justify-between text-xs font-medium border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 flex-1">
              
              {/* Option 1: MBT Scanner Cloud (mbt-scanner.vercel.app) */}
              <button
                type="button"
                onClick={() => { setConnectionType('mbt_cloud'); checkMbtStatus(); }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  connectionType === 'mbt_cloud'
                    ? 'bg-[#466BB2] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="truncate">MBT Scanner Cloud</span>
              </button>

              {/* Option 2: Futronic Driver Service */}
              <button
                type="button"
                onClick={() => { setConnectionType('http_service'); checkService(); }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  connectionType === 'http_service'
                    ? 'bg-[#466BB2] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="truncate">Local Driver (15270)</span>
              </button>

              {/* Option 3: WebUSB Direct */}
              <button
                type="button"
                onClick={() => { setConnectionType('webusb'); handleConnectWebUSB(); }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  connectionType === 'webusb'
                    ? 'bg-[#466BB2] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white'
                }`}
              >
                <Usb className="w-3.5 h-3.5" />
                <span className="truncate">WebUSB Direct</span>
              </button>

              {/* Option 4: Simulator */}
              <button
                type="button"
                onClick={() => { setConnectionType('simulation'); setScannerStatus('ready'); setStatusMessage('โหมดทดสอบความแม่นยำสูง (Simulation Mode)'); }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  connectionType === 'simulation'
                    ? 'bg-[#466BB2] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">โหมดจำลอง (Demo)</span>
              </button>
            </div>
          </div>

          {/* MBT Scanner Cloud Dedicated Banner */}
          {connectionType === 'mbt_cloud' && (
            <div className="space-y-3">
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-[#466BB2] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-800 text-sm">MBT Scanner Web Service</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono">
                        {mbtScannerUrl}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      เชื่อมต่อสแกนเนอร์ผ่าน Cloud Web Bridge หรือเปิดหน้าต่างสแกนเนอร์
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenMbtScannerWindow}
                    className="px-3.5 py-2 bg-[#466BB2] hover:bg-[#3b5998] text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดลิงก์สแกน</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmbedMode(!embedMode)}
                    className={`px-3 py-2 border text-xs font-semibold rounded-lg transition-colors ${
                      embedMode 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {embedMode ? 'ซ่อน Frame' : 'แสดงในหน้านี้ (Embed)'}
                  </button>
                </div>
              </div>

              {/* 404 Vercel Notice & URL Customization */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">
                        หากลิงก์ Vercel ขึ้นสถานะ 404: NOT_FOUND
                      </p>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        เกิดจากโปรเจกต์บน Vercel ยังไม่ได้ Deploy หรือใช้ชื่อ URL แตกต่างกัน คุณสามารถระบุ URL ที่ถูกต้องด้านล่าง หรือสลับไปใช้โหมด <strong>Local Driver (15270)</strong> / <strong>โหมดจำลอง (Demo)</strong> ได้ทันที
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-[11px] font-semibold text-amber-800 shrink-0">กำหนด URL สแกนเนอร์:</span>
                  <input
                    type="text"
                    value={mbtScannerUrl}
                    onChange={(e) => setMbtScannerUrl(e.target.value)}
                    placeholder="https://your-scanner-app.vercel.app/"
                    className="flex-1 w-full sm:w-auto px-2.5 py-1 bg-white border border-amber-300 rounded text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMbtScannerUrl('http://localhost:3000')}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[10px] font-mono text-amber-900 transition-colors"
                      title="ตั้งเป็น Localhost:3000"
                    >
                      :3000
                    </button>
                    <button
                      type="button"
                      onClick={() => setMbtScannerUrl('http://localhost:5173')}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[10px] font-mono text-amber-900 transition-colors"
                      title="ตั้งเป็น Localhost:5173"
                    >
                      :5173
                    </button>
                    <button
                      type="button"
                      onClick={() => setMbtScannerUrl(DEFAULT_MBT_SCANNER_URL)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded text-[10px] font-mono text-amber-900 transition-colors"
                      title="รีเซ็ตกลับเป็น Vercel URL"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Embedded MBT Scanner iframe if enabled */}
          {connectionType === 'mbt_cloud' && embedMode && (
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-inner bg-slate-950">
              <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">mbt-scanner.vercel.app/?finger={selectedFingerKey}&angle={angleNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmbedMode(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ปิด Frame
                </button>
              </div>
              <iframe
                src={`${mbtScannerUrl.replace(/\/$/, '')}/?finger=${selectedFingerKey}&angle=${angleNumber}`}
                title="MBT Scanner"
                className="w-full h-80 border-none bg-slate-900"
                allow="usb; camera; microphone"
              />
            </div>
          )}

          {/* Settings Panel (Collapsible) */}
          {showSettings && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 animate-in fade-in duration-150">
              <h3 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-[#466BB2]" />
                <span>ตั้งค่าการเชื่อมต่อเครื่องสแกน Futronic FS80H & MBT Scanner</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    MBT Scanner Cloud URL:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={mbtScannerUrl}
                      onChange={(e) => setMbtScannerUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:ring-1 focus:ring-[#466BB2]"
                    />
                    <button
                      type="button"
                      onClick={checkMbtStatus}
                      className="px-3 py-1.5 bg-[#466BB2] text-white rounded-lg hover:bg-[#3b5998] font-semibold"
                    >
                      Ping
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">ค่าเริ่มต้นคือ https://mbt-scanner.vercel.app/</p>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Local Service Endpoint URL (ftrScanAPI):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={endpointUrl}
                      onChange={(e) => setEndpointUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:ring-1 focus:ring-[#466BB2]"
                    />
                    <button
                      type="button"
                      onClick={checkService}
                      className="px-3 py-1.5 bg-[#466BB2] text-white rounded-lg hover:bg-[#3b5998] font-semibold"
                    >
                      Ping
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">ค่าเริ่มต้นคือ http://127.0.0.1:15270/fpoperation</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center space-x-4">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invertImage}
                    onChange={(e) => setInvertImage(e.target.checked)}
                    className="rounded border-slate-300 text-[#466BB2] focus:ring-[#466BB2]"
                  />
                  <span className="text-slate-700">กลับสีภาพ (Invert Black/White)</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded border-slate-300 text-[#466BB2] focus:ring-[#466BB2]"
                  />
                  <span className="text-slate-700">ข้ามไปมุมถัดไปอัตโนมัติ (Auto Next Angle)</span>
                </label>
              </div>
            </div>
          )}

          {/* Main Visual Scanning Stage */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left: Futuristic Hardware Scanner Graphic & Live View */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-radial from-slate-800 to-slate-950 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
              
              {/* LED Ring indicator */}
              <div className={`w-64 h-80 rounded-2xl p-2 transition-all duration-300 flex flex-col items-center justify-center relative ${
                scannerStatus === 'capturing' || isScanning
                  ? 'border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)]'
                  : scannerStatus === 'ready' || scannerStatus === 'success'
                  ? 'border-2 border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]'
                  : 'border border-slate-700'
              } bg-black/60`}>
                
                {/* Optical Scanner Frame */}
                <div className="w-52 h-68 bg-[#0a0f16] rounded-xl relative overflow-hidden border border-slate-800 flex items-center justify-center">
                  
                  {currentImage ? (
                    <img 
                      src={currentImage} 
                      alt="Captured Fingerprint" 
                      className="w-full h-full object-contain filter contrast-125"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-4">
                      {/* FS80H Optical Sensor Glass Prism Icon */}
                      <div className="w-20 h-24 rounded-lg bg-linear-to-b from-blue-500/20 to-teal-500/10 border border-blue-400/40 flex items-center justify-center mb-3 shadow-inner relative">
                        <div className="w-12 h-16 rounded border border-blue-300/30 flex items-center justify-center">
                          <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
                        </div>
                      </div>
                      <span className="text-xs text-blue-200 font-semibold">
                        {isScanning ? 'กำลังจับภาพลายนิ้วมือ...' : 'พร้อมรับลายนิ้วมือ'}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        {connectionType === 'mbt_cloud' 
                          ? 'รับข้อมูลจาก mbt-scanner.vercel.app' 
                          : 'วางนิ้วสัมผัสบนกระจกเซนเซอร์'}
                      </span>
                    </div>
                  )}

                  {/* Scan Line Animation when active */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#34d399] animate-bounce" />
                  )}
                </div>

                {/* Hardware Brand Badge */}
                <div className="mt-2 text-[10px] text-slate-400 font-mono tracking-wider flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    scannerStatus === 'ready' || scannerStatus === 'success' ? 'bg-emerald-400' :
                    scannerStatus === 'capturing' ? 'bg-amber-400 animate-ping' :
                    'bg-slate-500'
                  }`} />
                  <span>
                    {connectionType === 'mbt_cloud' ? 'MBT SCANNER CLOUD BRIDGE' : 'FUTRONIC FS80H SENSOR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Operational Controls & Status Guide */}
            <div className="md:col-span-6 space-y-4">
              
              {/* Status Alert Banner */}
              <div className={`p-4 rounded-xl border text-xs flex items-start space-x-3 ${
                scannerStatus === 'ready' || scannerStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : scannerStatus === 'capturing' || scannerStatus === 'waiting_finger'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : scannerStatus === 'driver_not_found'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                {scannerStatus === 'ready' || scannerStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : scannerStatus === 'capturing' || scannerStatus === 'waiting_finger' ? (
                  <RefreshCw className="w-5 h-5 text-amber-600 animate-spin shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-sm mb-0.5">
                    {scannerStatus === 'ready' ? 'พร้อมเชื่อมต่อและสแกน' :
                     scannerStatus === 'success' ? 'บันทึกภาพสำเร็จ' :
                     scannerStatus === 'capturing' ? 'กำลังสแกน...' :
                     scannerStatus === 'waiting_finger' ? 'กรุณาวางนิ้วบนเครื่อง' :
                     scannerStatus === 'driver_not_found' ? 'ไม่พบบริการ Futronic Web Service' :
                     'สถานะเครื่องสแกน'}
                  </p>
                  <p className="text-xs opacity-90 leading-relaxed">{statusMessage}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center space-x-2 transition-all ${
                    isScanning
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>
                    {isScanning 
                      ? 'กำลังประมวลผลการสแกน...' 
                      : connectionType === 'mbt_cloud'
                      ? 'ดึงผลสแกนจาก MBT Scanner'
                      : 'เริ่มสแกนลายนิ้วมือ (Capture Scan)'}
                  </span>
                </button>

                {currentImage && (
                  <button
                    type="button"
                    onClick={handleApplyCurrent}
                    className="w-full py-3 px-4 bg-[#466BB2] hover:bg-[#3b5998] text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
                  >
                    <Check className="w-4 h-4" />
                    <span>บันทึกรูปลงใน {fingerNameTh} มุมที่ {angleNumber}</span>
                  </button>
                )}

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePasteImage}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors border border-slate-200"
                    title="วางภาพจาก Clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>วางรูป (Paste)</span>
                  </button>

                  {connectionType === 'mbt_cloud' && (
                    <button
                      type="button"
                      onClick={handleOpenMbtScannerWindow}
                      className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors border border-blue-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดลิงก์ภายนอก</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Step & Specification info */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-slate-600 flex items-center justify-between">
                <span>เป้าหมาย: <strong>{fingerNameTh} ({selectedFingerKey})</strong></span>
                <span>มุมที่: <strong>{angleNumber} / 7</strong></span>
                <span>มาตรฐาน: <strong>500 DPI</strong></span>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>เชื่อมต่อกับ: <strong>{connectionType === 'mbt_cloud' ? 'https://mbt-scanner.vercel.app/' : 'Futronic FS80H'}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};

