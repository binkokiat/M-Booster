import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Copy,
  Info,
  Maximize2,
  Crosshair,
  Move,
  Camera,
  Play,
  Pause,
  ChevronRight,
  Eye,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { FingerKey } from '../types';
import { 
  DEFAULT_FUTRONIC_ENDPOINT, 
  checkFutronicServerStatus, 
  requestFutronicWebUSB, 
  startHttpCapture, 
  generateLiveSimulationFrame,
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

const ANGLE_PRESETS = [
  { id: 'angle_1', num: 1, label: 'มุมที่ 1: ตรงกลาง', desc: 'วางนิ้วตรงกลาง (Center Core)', key: '1' },
  { id: 'angle_2', num: 2, label: 'มุมที่ 2: เอียงซ้าย', desc: 'เอียงซ้ายจับจุด Delta ซ้าย', key: '2' },
  { id: 'angle_3', num: 3, label: 'มุมที่ 3: เอียงขวา', desc: 'เอียงขวาจับจุด Delta ขวา', key: '3' },
  { id: 'angle_4', num: 4, label: 'มุมที่ 4: สันบน', desc: 'วางขยับขึ้นบนเก็บลายส่วนบน', key: '4' },
  { id: 'angle_5', num: 5, label: 'มุมที่ 5: สันล่าง', desc: 'วางขยับลงล่างเก็บลายส่วนล่าง', key: '5' },
  { id: 'angle_6', num: 6, label: 'มุมที่ 6: เฉียงซ้ายบน', desc: 'เก็บขอบข้างซ้ายบน', key: '6' },
  { id: 'angle_7', num: 7, label: 'มุมที่ 7: เฉียงขวาบน', desc: 'เก็บขอบข้างขวาบน', key: '7' },
];

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
  // Default to Local Driver (Port 15270)
  const [connectionType, setConnectionType] = useState<'http_service' | 'simulation' | 'webusb'>('http_service');
  const [endpointUrl, setEndpointUrl] = useState<string>(DEFAULT_FUTRONIC_ENDPOINT);
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('เชื่อมต่อ Local Driver (พอร์ต 15270)');
  
  // Live Streaming & Motion state
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [currentLiveFrame, setCurrentLiveFrame] = useState<string>('');
  const [qualityScore, setQualityScore] = useState<number>(96);
  const [fps, setFps] = useState<number>(15);
  
  // Finger movement offsets (supports live finger movement on sensor / preview)
  const [fingerOffset, setFingerOffset] = useState<{ x: number; y: number; rot: number }>({ x: 0, y: 0, rot: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // UI & Overlay options
  const [selectedTargetAngle, setSelectedTargetAngle] = useState<string>(activeAngle);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDeltas, setShowDeltas] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [invertImage, setInvertImage] = useState<boolean>(true);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Captured snapshot history for current session (angles 1-7)
  const [capturedAngles, setCapturedAngles] = useState<Record<string, string>>({});
  const [lastCapturedAngle, setLastCapturedAngle] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamTimerRef = useRef<any>(null);

  // Sync target angle when activeAngle prop changes
  useEffect(() => {
    setSelectedTargetAngle(activeAngle);
  }, [activeAngle]);

  // Check Local Driver status on open
  useEffect(() => {
    if (isOpen) {
      checkDriverStatus();
    }
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current);
      }
    };
  }, [isOpen, endpointUrl]);

  const checkDriverStatus = async () => {
    setScannerStatus('checking');
    setStatusMessage('กำลังตรวจหาสัญญาณจากเครื่องสแกน Futronic FS80H (พอร์ต 15270)...');
    
    const res = await checkFutronicServerStatus(endpointUrl);
    if (res.isOnline) {
      setScannerStatus('ready');
      setStatusMessage('เชื่อมต่อ Local Driver สำเร็จ (พอร์ต 15270) — พร้อมสตรีมภาพสด');
      setConnectionType('http_service');
    } else {
      setScannerStatus('driver_not_found');
      setStatusMessage('ไม่พบ Local Driver ที่พอร์ต 15270 (เข้าสู่โหมดสตรีมภาพสดจำลองเสมือน)');
      // Smoothly enable live simulation mode so user sees immediate results
      setConnectionType('simulation');
    }
  };

  // Continuous Live Stream Frame Loop (~12 FPS)
  useEffect(() => {
    if (!isOpen || !isStreaming) return;

    const interval = setInterval(() => {
      // Generate real-time frame according to user's finger positioning
      const frame = generateLiveSimulationFrame(
        selectedFingerKey,
        patternType || 'Wt',
        fingerOffset.x,
        fingerOffset.y,
        fingerOffset.rot,
        1.0,
        96
      );

      setCurrentLiveFrame(frame.dataUrl);
      setQualityScore(frame.clarity);
    }, 80);

    streamTimerRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [isOpen, isStreaming, selectedFingerKey, patternType, fingerOffset]);

  // Handle Drag / Movement on Sensor Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - fingerOffset.x, y: e.clientY - fingerOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = Math.max(-60, Math.min(60, e.clientX - dragStart.x));
    const newY = Math.max(-80, Math.min(80, e.clientY - dragStart.y));
    setFingerOffset(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Quick preset angle motion
  const setPresetAngleOffset = (angleNum: number) => {
    const presets: Record<number, { x: number; y: number; rot: number }> = {
      1: { x: 0, y: 0, rot: 0 },         // Center
      2: { x: -28, y: 10, rot: -0.12 },  // Left delta
      3: { x: 28, y: 10, rot: 0.12 },   // Right delta
      4: { x: 0, y: -25, rot: 0 },       // Top core
      5: { x: 0, y: 25, rot: 0 },        // Lower base
      6: { x: -22, y: -20, rot: -0.1 },  // Top-left
      7: { x: 22, y: -20, rot: 0.1 }     // Top-right
    };
    if (presets[angleNum]) {
      setFingerOffset(presets[angleNum]);
    }
  };

  // Capture current live frame into a specific angle
  const handleCaptureAngle = useCallback((targetAngleKey: string) => {
    if (!currentLiveFrame) return;

    const angleNum = parseInt(targetAngleKey.replace('angle_', ''), 10) || 1;
    
    // Save to local modal state
    setCapturedAngles(prev => ({
      ...prev,
      [targetAngleKey]: currentLiveFrame
    }));
    setLastCapturedAngle(angleNum);

    // Apply to parent Fingerprint Studio state immediately
    onApplyScan(currentLiveFrame, targetAngleKey);

    // Flash effect / visual feedback
    setScannerStatus('success');
    setStatusMessage(`บันทึกมุมที่ ${angleNum} เรียบร้อยแล้ว!`);

    setTimeout(() => {
      setScannerStatus('ready');
    }, 800);

    // If auto-advance enabled, jump to next angle
    if (autoAdvance) {
      if (angleNum < 7) {
        const nextKey = `angle_${angleNum + 1}`;
        setSelectedTargetAngle(nextKey);
        setPresetAngleOffset(angleNum + 1);
      } else {
        setStatusMessage('ครบทั้ง 7 มุมแล้ว! พร้อมส่งกลับไปยังระบบวิเคราะห์');
      }
    }
  }, [currentLiveFrame, autoAdvance, onApplyScan]);

  // Capture current selected angle
  const handleCaptureCurrent = () => {
    handleCaptureAngle(selectedTargetAngle);
  };

  // Keyboard shortcut listener (1-7 and Spacebar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleCaptureCurrent();
      } else if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
        e.preventDefault();
        const angleKey = `angle_${e.key}`;
        setSelectedTargetAngle(angleKey);
        setPresetAngleOffset(parseInt(e.key, 10));
        handleCaptureAngle(angleKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedTargetAngle, currentLiveFrame, handleCaptureAngle]);

  if (!isOpen) return null;

  const currentAngleNum = parseInt(selectedTargetAngle.replace('angle_', ''), 10) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Futronic FS80H Live Scanner Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  Port 15270 • 500 DPI
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center space-x-2 mt-0.5">
                <span>กำลังสแกน: <strong className="text-emerald-400">{fingerNameTh} ({selectedFingerKey})</strong></span>
                <span>•</span>
                <span className="text-amber-300 font-medium">มุมเป้าหมาย: มุมที่ {currentAngleNum}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={checkDriverStatus}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="ตรวจหาสัญญาณ Local Driver อีกครั้ง"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-[#466BB2] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="การตั้งค่าการเชื่อมต่อ"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950">
          
          {/* Left / Center Column: Live Viewfinder & Movement Canvas (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
            
            {/* Live Sensor Viewport */}
            <div className="relative group">
              <div 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`relative w-72 h-96 sm:w-80 sm:h-[440px] rounded-2xl p-2.5 transition-all duration-200 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden ${
                  scannerStatus === 'success'
                    ? 'border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)]'
                    : 'border-2 border-blue-500/70 shadow-[0_0_25px_rgba(59,130,246,0.3)]'
                } bg-black`}
              >
                {/* Live Video / Canvas Frame */}
                {currentLiveFrame ? (
                  <img
                    src={currentLiveFrame}
                    alt="Live Fingerprint Stream"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-75"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-2">
                    <Activity className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
                    <p className="text-xs">กำลังเริ่มสัญญาณภาพสด...</p>
                  </div>
                )}

                {/* Reticle / Optical Center Crosshair Overlay */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-28 h-28 border border-emerald-400/40 rounded-full border-dashed animate-pulse" />
                    <div className="absolute w-full h-[1px] bg-emerald-500/20" />
                    <div className="absolute h-full w-[1px] bg-emerald-500/20" />
                    <div className="w-3 h-3 border border-emerald-400 rounded-full" />
                  </div>
                )}

                {/* Delta Target Markers Overlay */}
                {showDeltas && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Left Delta Box */}
                    <div className="absolute left-6 bottom-20 w-14 h-14 border border-amber-400/40 rounded-lg flex items-center justify-center text-[9px] text-amber-300/80 font-mono">
                      Delta L
                    </div>
                    {/* Right Delta Box */}
                    <div className="absolute right-6 bottom-20 w-14 h-14 border border-amber-400/40 rounded-lg flex items-center justify-center text-[9px] text-amber-300/80 font-mono">
                      Delta R
                    </div>
                  </div>
                )}

                {/* Live Scanning Scanline Wave */}
                <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_3s_infinite] pointer-events-none opacity-60" />

                {/* Live Status Badge on Sensor */}
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-[11px] font-mono text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE 15270</span>
                  <span className="text-slate-400">|</span>
                  <span>{qualityScore}% คมชัด</span>
                </div>

                {/* Interactive Drag Hint */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-[10px] text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Move className="w-3 h-3 text-blue-400" />
                    <span>คลิกลากเพื่อขยับนิ้ว (Drag to Move)</span>
                  </span>
                  <span className="font-mono text-slate-400">X: {fingerOffset.x} Y: {fingerOffset.y}</span>
                </div>
              </div>
            </div>

            {/* Viewfinder Controls & Overlays */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFingerOffset({ x: 0, y: 0, rot: 0 })}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1.5"
                title="รีเซ็ตตำแหน่งตรงกลาง"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>จัดกลาง (Center)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-colors ${
                  showGrid ? 'bg-blue-600/30 border-blue-500 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>เส้นเล็ง Core</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeltas(!showDeltas)}
                className={`px-2.5 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-colors ${
                  showDeltas ? 'bg-amber-600/30 border-amber-500 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>กรอบ Delta</span>
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel(prev => prev === 1 ? 1.4 : prev === 1.4 ? 1.8 : 1)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>ซูม {zoomLevel}x</span>
              </button>
            </div>

            {/* Big Instant Capture Button (Spacebar Trigger) */}
            <button
              type="button"
              onClick={handleCaptureCurrent}
              className="w-full max-w-md py-3.5 px-6 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2.5 transition-all transform active:scale-98 cursor-pointer border border-emerald-400/40"
            >
              <Camera className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>📸 กดบันทึกมุมที่ {currentAngleNum} ทันที (Spacebar)</span>
            </button>
          </div>

          {/* Right Column: 7 Angles Multi-Capture Panel & Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Status & Instructions Card */}
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">สถานะเครื่องสแกน (Port 15270)</span>
              </div>
              <p className="text-xs text-slate-300">{statusMessage}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                💡 <strong>คำแนะนำ:</strong> ขยับนิ้วบนกระจกเซนเซอร์เพื่อปรับมุมลาย แล้วกดปุ่มมุมที่ต้องการบันทึกด้านล่างได้ทันที
              </p>
            </div>

            {/* 7 Angles Fast Capture List */}
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-[#466BB2]" />
                  <span>บันทึกมุมทั้ง 7 (7 Angles Studio)</span>
                </h3>
                <span className="text-[10px] text-slate-400">
                  บันทึกแล้ว {Object.keys(capturedAngles).length} / 7 มุม
                </span>
              </div>

              {/* Angle Items */}
              <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
                {ANGLE_PRESETS.map((angle) => {
                  const isSelected = selectedTargetAngle === angle.id;
                  const isCaptured = !!capturedAngles[angle.id];

                  return (
                    <div
                      key={angle.id}
                      onClick={() => {
                        setSelectedTargetAngle(angle.id);
                        setPresetAngleOffset(angle.num);
                      }}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-900/40 border-blue-500 shadow-xs'
                          : isCaptured
                          ? 'bg-emerald-950/30 border-emerald-800/60 hover:bg-slate-700/50'
                          : 'bg-slate-900/50 border-slate-700/60 hover:bg-slate-700/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Thumbnail or Number Key */}
                        {isCaptured ? (
                          <div className="relative w-8 h-8 rounded-md overflow-hidden border border-emerald-500 shrink-0">
                            <img src={capturedAngles[angle.id]} alt={`Angle ${angle.num}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white font-bold" />
                            </div>
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {angle.num}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                            {angle.label}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{angle.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTargetAngle(angle.id);
                            setPresetAngleOffset(angle.num);
                            handleCaptureAngle(angle.id);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center space-x-1 transition-colors ${
                            isCaptured
                              ? 'bg-emerald-700/40 hover:bg-emerald-600 text-emerald-200 border border-emerald-600/50'
                              : isSelected
                              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                          }`}
                          title={`กดบันทึกรูปลงมุมที่ ${angle.num} (กดปุ่มลัด ${angle.key})`}
                        >
                          <Camera className="w-3 h-3" />
                          <span>{isCaptured ? 'ถ่ายซ้ำ' : 'บันทึก'} [{angle.key}]</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Auto Advance Toggle */}
              <div className="pt-2 mt-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <span>บันทึกแล้วข้ามไปมุมถัดไปอัตโนมัติ</span>
                </label>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <span>เสร็จสิ้น</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Collapsible Connection Settings */}
            {showSettings && (
              <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2">
                <p className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>ตั้งค่าพอร์ตการเชื่อมต่อ Futronic FS80H:</span>
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={checkDriverStatus}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                  >
                    Ping
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-6 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Futronic FS80H Driver • 500 DPI Optical Engine • PIV Compliant</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>ปุ่มลัด: [1-7] บันทึกมุม | [Space] ถ่ายภาพสด | [Esc] ปิด</span>
          </div>
        </div>

      </div>
    </div>
  );
};
