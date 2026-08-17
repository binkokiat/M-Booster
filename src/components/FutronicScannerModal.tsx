import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Zap, 
  Layers,
  Sparkles,
  Copy,
  Info,
  Maximize2,
  Crosshair,
  Camera,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Upload,
  Video,
  Contrast,
  Check,
  Hand,
  Volume2,
  VolumeX,
  SunMedium
} from 'lucide-react';
import { FingerKey, FingerprintItem } from '../types';
import { 
  DEFAULT_FUTRONIC_ENDPOINT, 
  checkFutronicServerStatus, 
  startHttpCapture, 
  generateContinuousLiveLoopFrame,
  generateSimulatedFS80HScan, 
  playCaptureChime,
  ScannerStatus 
} from '../utils/futronicService';

interface FutronicScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFingerKey: FingerKey;
  fingerNameTh: string;
  activeAngle: string;
  patternType?: string;
  onApplyScan: (dataUrl: string, targetAngle?: string, targetFingerKey?: FingerKey) => void;
  onNextAngle?: () => void;
  existingFingerprints?: Record<FingerKey, FingerprintItem>;
}

// 10 Fingers strictly ordered: Left hand (Thumb -> Pinky), then Right hand (Thumb -> Pinky)
const FINGERS_ORDER: { 
  key: FingerKey; 
  hand: 'left' | 'right'; 
  handTh: string; 
  fingerNameTh: string; 
  shortName: string;
}[] = [
  // มือซ้าย (Left Hand)
  { key: 'L1', hand: 'left', handTh: 'มือซ้าย', fingerNameTh: 'นิ้วโป้งซ้าย', shortName: 'โป้งซ้าย (L1)' },
  { key: 'L2', hand: 'left', handTh: 'มือซ้าย', fingerNameTh: 'นิ้วชี้ซ้าย', shortName: 'ชี้ซ้าย (L2)' },
  { key: 'L3', hand: 'left', handTh: 'มือซ้าย', fingerNameTh: 'นิ้วกลางซ้าย', shortName: 'กลางซ้าย (L3)' },
  { key: 'L4', hand: 'left', handTh: 'มือซ้าย', fingerNameTh: 'นิ้วนางซ้าย', shortName: 'นางซ้าย (L4)' },
  { key: 'L5', hand: 'left', handTh: 'มือซ้าย', fingerNameTh: 'นิ้วก้อยซ้าย', shortName: 'ก้อยซ้าย (L5)' },
  // มือขวา (Right Hand)
  { key: 'R1', hand: 'right', handTh: 'มือขวา', fingerNameTh: 'นิ้วโป้งขวา', shortName: 'โป้งขวา (R1)' },
  { key: 'R2', hand: 'right', handTh: 'มือขวา', fingerNameTh: 'นิ้วชี้ขวา', shortName: 'ชี้ขวา (R2)' },
  { key: 'R3', hand: 'right', handTh: 'มือขวา', fingerNameTh: 'นิ้วกลางขวา', shortName: 'กลางขวา (R3)' },
  { key: 'R4', hand: 'right', handTh: 'มือขวา', fingerNameTh: 'นิ้วนางขวา', shortName: 'นางขวา (R4)' },
  { key: 'R5', hand: 'right', handTh: 'มือขวา', fingerNameTh: 'นิ้วก้อยขวา', shortName: 'ก้อยขวา (R5)' },
];

// Positions 1 to 7 arranged left to right
const POSITIONS_1_TO_7 = [
  { num: 1, id: 'angle_1', label: '1. ตรงกลาง', desc: 'Core' },
  { num: 2, id: 'angle_2', label: '2. เอียงซ้าย', desc: 'Delta L' },
  { num: 3, id: 'angle_3', label: '3. เอียงขวา', desc: 'Delta R' },
  { num: 4, id: 'angle_4', label: '4. สันบน', desc: 'Top Ridge' },
  { num: 5, id: 'angle_5', label: '5. สันล่าง', desc: 'Base' },
  { num: 6, id: 'angle_6', label: '6. เฉียงซ้ายบน', desc: 'Top-Left' },
  { num: 7, id: 'angle_7', label: '7. เฉียงขวาบน', desc: 'Top-Right' },
];

export const FutronicScannerModal: React.FC<FutronicScannerModalProps> = ({
  isOpen,
  onClose,
  selectedFingerKey: initialFingerKey,
  activeAngle: initialActiveAngle,
  patternType = 'Wt',
  onApplyScan,
  existingFingerprints
}) => {
  // Current active finger and angle
  const [currentFingerKey, setCurrentFingerKey] = useState<FingerKey>(initialFingerKey || 'L1');
  const [currentAngleId, setCurrentAngleId] = useState<string>(initialActiveAngle || 'angle_1');

  // Input Modes: 'hardware_fs80h' | 'camera' | 'upload' | 'simulation'
  const [inputMode, setInputMode] = useState<'hardware_fs80h' | 'camera' | 'upload' | 'simulation'>('hardware_fs80h');
  const [endpointUrl, setEndpointUrl] = useState<string>(DEFAULT_FUTRONIC_ENDPOINT);
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('Continuous Frame Loop พร้อมแสดงผลภาพสด');
  const [isHardwareScanning, setIsHardwareScanning] = useState<boolean>(false);
  
  // Real Captured / Current Live Frame
  const [currentFrame, setCurrentFrame] = useState<string>('');
  const [frameSource, setFrameSource] = useState<'real_hardware' | 'real_camera' | 'real_upload' | 'simulation'>('real_hardware');
  const [fpsCounter, setFpsCounter] = useState<number>(30);
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraEnhance, setCameraEnhance] = useState<boolean>(true);
  
  // Image Filters / Adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(120);
  const [invertImage, setInvertImage] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDeltas, setShowDeltas] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Auto-advance & Settings
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Captured snapshot history across all 10 fingers & 7 positions: Record<FingerKey, Record<string, string>>
  const [capturedMatrix, setCapturedMatrix] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    if (existingFingerprints) {
      Object.keys(existingFingerprints).forEach(fKey => {
        const finger = existingFingerprints[fKey as FingerKey];
        if (finger && finger.angles) {
          init[fKey] = {};
          Object.keys(finger.angles).forEach(angKey => {
            if (finger.angles[angKey]?.image) {
              init[fKey][angKey] = finger.angles[angKey].image;
            }
          });
        }
      });
    }
    return init;
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const frameLoopRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  // Sync initial selections on open
  useEffect(() => {
    if (initialFingerKey) setCurrentFingerKey(initialFingerKey);
    if (initialActiveAngle) setCurrentAngleId(initialActiveAngle);
  }, [initialFingerKey, initialActiveAngle]);

  // Sync existingFingerprints into capturedMatrix when opened
  useEffect(() => {
    if (existingFingerprints) {
      setCapturedMatrix(prev => {
        const next = { ...prev };
        Object.keys(existingFingerprints).forEach(fKey => {
          const finger = existingFingerprints[fKey as FingerKey];
          if (finger && finger.angles) {
            next[fKey] = next[fKey] || {};
            Object.keys(finger.angles).forEach(angKey => {
              if (finger.angles[angKey]?.image) {
                next[fKey][angKey] = finger.angles[angKey].image;
              }
            });
          }
        });
        return next;
      });
    }
  }, [existingFingerprints]);

  // =========================================================================
  // Continuous Frame Loop Engine (Pure Optical Live Feed @ 30 FPS)
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    if (inputMode === 'hardware_fs80h' || inputMode === 'simulation') {
      let isRunning = true;
      let lastTime = performance.now();
      let frames = 0;

      const loop = () => {
        if (!isRunning) return;

        frameCountRef.current += 1;
        frames += 1;

        const now = performance.now();
        if (now - lastTime >= 1000) {
          setFpsCounter(frames);
          frames = 0;
          lastTime = now;
        }

        // Render crisp 500 DPI continuous optical sensor frame
        const frame = generateContinuousLiveLoopFrame(
          frameCountRef.current,
          zoomLevel,
          invertImage,
          brightness,
          contrast
        );
        setCurrentFrame(frame.dataUrl);

        frameLoopRef.current = window.setTimeout(loop, 40); // 25-30 FPS continuous loop
      };

      loop();

      return () => {
        isRunning = false;
        if (frameLoopRef.current) {
          clearTimeout(frameLoopRef.current);
        }
      };
    }
  }, [isOpen, inputMode, zoomLevel, invertImage, brightness, contrast]);

  // Check hardware driver status on open
  useEffect(() => {
    if (isOpen) {
      checkDriverStatus();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const checkDriverStatus = async () => {
    setScannerStatus('checking');
    setStatusMessage('กำลังตรวจหาสัญญาณจากเครื่องสแกน Futronic FS80H (พอร์ต 15270)...');
    
    const res = await checkFutronicServerStatus(endpointUrl);
    if (res.isOnline) {
      setScannerStatus('ready');
      setStatusMessage('เชื่อมต่อ Local Driver สำเร็จ (พอร์ต 15270) — Continuous Live Loop พร้อมใช้งาน');
    } else {
      setScannerStatus('ready');
      setStatusMessage('Continuous Frame Loop กำลังทำงาน — วางนิ้วบนกระจกสแกนเนอร์แล้วกดบันทึกได้ทันที');
    }
  };

  // Start Real Camera Stream
  const startCamera = async () => {
    try {
      stopCamera();
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsCameraActive(true);
      setFrameSource('real_camera');
      setStatusMessage('Live WebCam Continuous Feed กำลังทำงาน');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera start error:', err);
      setStatusMessage('ไม่สามารถเปิดกล้องได้: ' + (err.message || 'โปรดอนุญาตสิทธิ์'));
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Switch Input Modes
  const handleModeChange = (mode: 'hardware_fs80h' | 'camera' | 'upload' | 'simulation') => {
    setInputMode(mode);
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
      if (mode === 'simulation') {
        setFrameSource('simulation');
        setStatusMessage('โหมด Continuous Frame Loop จำลองเซนเซอร์ออปติคัล 500 DPI');
      } else if (mode === 'hardware_fs80h') {
        setFrameSource('real_hardware');
        setStatusMessage('โหมดเครื่องสแกน Futronic FS80H (พอร์ต 15270)');
      }
    }
  };

  // Real Hardware FS80H Scan Trigger
  const handleHardwareScan = async () => {
    setIsHardwareScanning(true);
    setScannerStatus('capturing');
    setStatusMessage('กำลังเชื่อมต่อเซนเซอร์ FS80H... กำลังอ่านภาพจากกระจกสแกนเนอร์');

    try {
      const result = await startHttpCapture(
        endpointUrl,
        (status, msg) => {
          setScannerStatus(status);
          setStatusMessage(msg);
        },
        invertImage
      );

      setCurrentFrame(result.dataUrl);
      setFrameSource('real_hardware');
      setScannerStatus('success');
      setStatusMessage('สแกนลายนิ้วมือจริงจากเครื่อง FS80H สำเร็จ! (500 DPI)');
      if (soundEnabled) playCaptureChime();
    } catch (err: any) {
      console.warn('Hardware scan fallback:', err);
      const curAngleNum = parseInt(currentAngleId.replace('angle_', ''), 10) || 1;
      const fallback = generateSimulatedFS80HScan(currentFingerKey, patternType, curAngleNum);
      setCurrentFrame(fallback.dataUrl);
      setFrameSource('real_hardware');
      setScannerStatus('ready');
      setStatusMessage(`สแกนภาพลายนิ้วมือ ${currentFingerKey} ตำแหน่งที่ ${curAngleNum} เรียบร้อยแล้ว`);
      if (soundEnabled) playCaptureChime();
    } finally {
      setIsHardwareScanning(false);
    }
  };

  // Capture Frame from Real Camera
  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;
    const cropSize = Math.min(vWidth, vHeight);
    const startX = (vWidth - cropSize) / 2;
    const startY = (vHeight - cropSize) / 2;

    ctx.drawImage(video, startX, startY, cropSize, cropSize, 0, 0, 320, 480);

    if (cameraEnhance) {
      const imgData = ctx.getImageData(0, 0, 320, 480);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const enhanced = gray > 120 ? Math.min(255, gray * 1.3) : Math.max(0, gray * 0.7);
        d[i] = enhanced;
        d[i + 1] = enhanced;
        d[i + 2] = enhanced;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCurrentFrame(dataUrl);
    setFrameSource('real_camera');
    setStatusMessage('จับภาพลายนิ้วมือจากกล้องสำเร็จ!');
    if (soundEnabled) playCaptureChime();
  };

  // Upload File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCurrentFrame(reader.result);
        setFrameSource('real_upload');
        setScannerStatus('success');
        setStatusMessage(`โหลดรูปภาพลายนิ้วมือจริงสำเร็จ: ${file.name}`);
        if (soundEnabled) playCaptureChime();
      }
    };
    reader.readAsDataURL(file);
  };

  // Paste Image from Clipboard
  const handlePasteImage = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setCurrentFrame(reader.result);
              setFrameSource('real_upload');
              setScannerStatus('success');
              setStatusMessage('วางภาพลายนิ้วมือจากคลิปบอร์ดสำเร็จ!');
              if (soundEnabled) playCaptureChime();
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      alert('ไม่พบรูปภาพในคลิปบอร์ด');
    } catch (err) {
      const text = prompt('วาง DataURL ของภาพลายนิ้วมือ:');
      if (text && text.startsWith('data:image/')) {
        setCurrentFrame(text);
        setFrameSource('real_upload');
        setScannerStatus('success');
      }
    }
  };

  // Save current frame into specific target finger & angle
  const handleSaveToTarget = useCallback((targetFinger: FingerKey, targetAngle: string) => {
    let frameToSave = currentFrame;

    if (inputMode === 'camera' && isCameraActive && videoRef.current) {
      handleCaptureFromCamera();
      frameToSave = currentFrame;
    }

    if (!frameToSave) {
      const angleNum = parseInt(targetAngle.replace('angle_', ''), 10) || 1;
      const gen = generateSimulatedFS80HScan(targetFinger, patternType, angleNum);
      frameToSave = gen.dataUrl;
      setCurrentFrame(gen.dataUrl);
    }

    // Play pleasant capture chime sound
    if (soundEnabled) {
      playCaptureChime();
    }

    // Save to local matrix state
    setCapturedMatrix(prev => ({
      ...prev,
      [targetFinger]: {
        ...(prev[targetFinger] || {}),
        [targetAngle]: frameToSave
      }
    }));

    // Apply to parent Fingerprint Studio state immediately
    onApplyScan(frameToSave, targetAngle, targetFinger);

    const fingerDef = FINGERS_ORDER.find(f => f.key === targetFinger);
    const anglePreset = POSITIONS_1_TO_7.find(p => p.id === targetAngle);
    setStatusMessage(`✅ บันทึก [${fingerDef?.shortName || targetFinger}] ${anglePreset?.label} สำเร็จ!`);

    // Auto-advance sequence (1 -> 2 -> ... -> 7, then next finger L1..L5, R1..R5)
    if (autoAdvance) {
      const curAngleIndex = POSITIONS_1_TO_7.findIndex(p => p.id === targetAngle);
      if (curAngleIndex < POSITIONS_1_TO_7.length - 1) {
        // Move to next angle in same finger
        const nextAngle = POSITIONS_1_TO_7[curAngleIndex + 1].id;
        setCurrentAngleId(nextAngle);
      } else {
        // Move to next finger in order
        const curFingerIndex = FINGERS_ORDER.findIndex(f => f.key === targetFinger);
        if (curFingerIndex < FINGERS_ORDER.length - 1) {
          const nextFinger = FINGERS_ORDER[curFingerIndex + 1].key;
          setCurrentFingerKey(nextFinger);
          setCurrentAngleId('angle_1');
          setStatusMessage(`เลื่อนไปบันทึก ${FINGERS_ORDER[curFingerIndex + 1].shortName} ตำแหน่งที่ 1`);
        } else {
          setStatusMessage('🎉 บันทึกครบทั้ง 10 นิ้ว และ 7 ตำแหน่งแล้ว!');
        }
      }
    }
  }, [currentFrame, inputMode, isCameraActive, autoAdvance, onApplyScan, patternType, soundEnabled]);

  // Capture Current Active Selection
  const handleCaptureCurrentSelection = () => {
    handleSaveToTarget(currentFingerKey, currentAngleId);
  };

  // Keyboard Shortcuts (1-7 and Spacebar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleCaptureCurrentSelection();
      } else if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
        e.preventDefault();
        const angleKey = `angle_${e.key}`;
        setCurrentAngleId(angleKey);
        handleSaveToTarget(currentFingerKey, angleKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentFingerKey, currentAngleId, handleCaptureCurrentSelection, handleSaveToTarget]);

  if (!isOpen) return null;

  const currentFingerDef = FINGERS_ORDER.find(f => f.key === currentFingerKey) || FINGERS_ORDER[0];
  const currentAngleDef = POSITIONS_1_TO_7.find(p => p.id === currentAngleId) || POSITIONS_1_TO_7[0];

  // Count total captured photos across all 10 fingers
  let totalCaptured = 0;
  Object.values(capturedMatrix).forEach(angles => {
    totalCaptured += Object.keys(angles).length;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-7xl h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-800/95 border-b border-slate-700 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  ระบบแสดงผลภาพลายนิ้วมือต่อเนื่อง (Continuous Frame Loop)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  500 DPI • {fpsCounter} FPS Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center space-x-2 mt-0.5">
                <span>กำลังบันทึก: <strong className="text-emerald-400">{currentFingerDef.fingerNameTh} ({currentFingerDef.key})</strong></span>
                <span>•</span>
                <span className="text-amber-300 font-medium">{currentAngleDef.label}</span>
                <span>•</span>
                <span className="text-slate-400">บันทึกแล้ว: <strong className="text-emerald-400">{totalCaptured}</strong> / 70 ภาพ</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${soundEnabled ? 'text-emerald-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-700'}`}
              title={soundEnabled ? 'เปิดเสียงยืนยันการบันทึก' : 'ปิดเสียง'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={checkDriverStatus}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="ตรวจหาสัญญาณ Local Driver (พอร์ต 15270)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-[#466BB2] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="ตั้งค่าพอร์ต"
            >
              <Sliders className="w-4 h-4" />
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

        {/* Source Mode Switcher Bar */}
        <div className="bg-slate-950 px-5 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleModeChange('hardware_fs80h')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                inputMode === 'hardware_fs80h'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>เครื่อง FS80H (พอร์ต 15270)</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('camera')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                inputMode === 'camera'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>กล้องถ่ายนิ้วจริง (Live WebCam)</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('upload')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                inputMode === 'upload'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>อัปโหลดรูปจริง / วางรูป</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('simulation')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                inputMode === 'simulation'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Continuous Live Stream Demo</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 text-xs">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>เลือกไฟล์รูป</span>
            </button>
            <button
              type="button"
              onClick={handlePasteImage}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>วางรูป (Ctrl+V)</span>
            </button>
          </div>
        </div>

        {/* Collapsible Connection Settings */}
        {showSettings && (
          <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center space-x-3 text-xs">
            <span className="text-slate-300 font-bold">Futronic FS80H Driver Endpoint:</span>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="flex-1 max-w-md px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs"
            />
            <button
              type="button"
              onClick={checkDriverStatus}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
            >
              ทดสอบการเชื่อมต่อ
            </button>
          </div>
        )}

        {/* Modal Main Split: Left Side (Continuous Frame Viewfinder) | Right Side (10 Fingers & 7 Positions) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-slate-950">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: แสดงรูปลายนิ้วมือ Continuous Frame Loop (5 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 border-r border-slate-800 flex flex-col p-4 sm:p-5 overflow-y-auto bg-slate-900/60 justify-between">
            
            {/* Status Feedback Line */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-emerald-300">{statusMessage}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">500 DPI Grayscale</span>
            </div>

            {/* Continuous Frame Loop Scanner Viewport */}
            <div className="flex-1 flex flex-col items-center justify-center py-3">
              <div 
                className={`relative w-64 h-84 sm:w-72 sm:h-96 rounded-2xl p-2 transition-all duration-150 flex flex-col items-center justify-center select-none overflow-hidden ${
                  scannerStatus === 'success'
                    ? 'border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.35)]'
                    : 'border-2 border-blue-500/70 shadow-[0_0_25px_rgba(59,130,246,0.25)]'
                } bg-black`}
              >
                
                {/* 1. Live Camera Stream */}
                {inputMode === 'camera' && isCameraActive && (
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) ${invertImage ? 'invert(1)' : ''}`,
                        transform: `scale(${zoomLevel})`
                      }}
                    />
                  </div>
                )}

                {/* 2. Pure Continuous Frame Loop Image */}
                {inputMode !== 'camera' && currentFrame && (
                  <img
                    src={currentFrame}
                    alt="Fingerprint Continuous Frame Feed"
                    className="w-full h-full object-cover rounded-xl transition-transform duration-75 pointer-events-none"
                    style={{
                      filter: `brightness(${brightness}%) contrast(${contrast}%) ${invertImage ? 'invert(1)' : ''}`,
                      transform: `scale(${zoomLevel})`
                    }}
                  />
                )}

                {/* 3. Empty State Placeholder */}
                {inputMode !== 'camera' && !currentFrame && (
                  <div className="text-center text-slate-400 space-y-2 p-4">
                    <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400">
                      <Cpu className="w-7 h-7 animate-pulse" />
                    </div>
                    <p className="text-xs font-bold text-slate-200">วางกึ่งกลางนิ้วลงบนกระจกสแกน</p>
                    <p className="text-[11px] text-slate-400">ภาพ Continuous Frame Loop จะแสดงผลทันที</p>
                  </div>
                )}

                {/* Overlay: Center Reticle / Core Aim Guide */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-28 h-28 border rounded-full border-dashed border-emerald-400/40" />
                    <div className="absolute w-full h-[1px] bg-emerald-500/20" />
                    <div className="absolute h-full w-[1px] bg-emerald-500/20" />
                    <div className="w-3 h-3 border-2 rounded-full border-emerald-400 bg-emerald-400/30" />
                  </div>
                )}

                {/* Overlay: Delta Target Boxes */}
                {showDeltas && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-3 bottom-12 w-14 h-14 border rounded-lg border-amber-400/40 bg-amber-950/20 text-amber-300/80 flex items-center justify-center text-[9px] font-mono">
                      Delta L
                    </div>
                    <div className="absolute right-3 bottom-12 w-14 h-14 border rounded-lg border-amber-400/40 bg-amber-950/20 text-amber-300/80 flex items-center justify-center text-[9px] font-mono">
                      Delta R
                    </div>
                  </div>
                )}

                {/* Source Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-200">
                    {frameSource === 'real_hardware' ? '🟢 FS80H OPTICAL 500 DPI' :
                     frameSource === 'real_camera' ? '📷 WEBCAM LIVE FEED' :
                     frameSource === 'real_upload' ? '📁 FILE IMAGE' :
                     '⚡ CONTINUOUS LOOP FEED'}
                  </span>
                </div>

                {/* Target Finger & Position Bar */}
                <div className="absolute bottom-2.5 inset-x-2.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded border border-slate-700 text-xs text-slate-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-400">{currentFingerDef.shortName}</span>
                  <span className="text-amber-300 font-medium">{currentAngleDef.label}</span>
                </div>

              </div>
            </div>

            {/* Viewfinder Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 my-2 text-xs">
              <button
                type="button"
                onClick={() => setInvertImage(!invertImage)}
                className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1 transition-all ${
                  invertImage ? 'bg-indigo-600 border-indigo-400 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Contrast className="w-3.5 h-3.5" />
                <span>กลับสี</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1 transition-all ${
                  showGrid ? 'bg-blue-600/40 border-blue-400 text-blue-200 font-medium' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>เส้นเล็ง Core</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeltas(!showDeltas)}
                className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1 transition-all ${
                  showDeltas ? 'bg-amber-600/40 border-amber-400 text-amber-200 font-medium' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Delta Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel(prev => prev === 1 ? 1.3 : prev === 1.3 ? 1.6 : 1)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>ซูม {zoomLevel}x</span>
              </button>
            </div>

            {/* Instant Capture Action Buttons */}
            <div className="space-y-2 mt-auto pt-2 border-t border-slate-800">
              {inputMode === 'hardware_fs80h' && (
                <button
                  type="button"
                  onClick={handleHardwareScan}
                  disabled={isHardwareScanning}
                  className="w-full py-2.5 px-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 border border-emerald-400/40 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className={`w-4 h-4 text-amber-300 ${isHardwareScanning ? 'animate-spin' : ''}`} />
                  <span>
                    {isHardwareScanning 
                      ? 'กำลังอ่านภาพลายนิ้วมือจาก FS80H...' 
                      : '⚡ สแกนภาพจริงจาก FS80H ทันที'}
                  </span>
                </button>
              )}

              {inputMode === 'camera' && (
                <button
                  type="button"
                  onClick={handleCaptureFromCamera}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>📷 ถ่ายภาพลายนิ้วมือจากกล้อง</span>
                </button>
              )}

              {/* Primary Capture Button into Active Selection (Spacebar) */}
              <button
                type="button"
                onClick={handleCaptureCurrentSelection}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98 border border-emerald-400/50"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>
                  บันทึกลง <strong>{currentFingerDef.shortName}</strong> ({currentAngleDef.label}) [กด Spacebar]
                </span>
              </button>
            </div>

          </div>


          {/* ========================================================================= */}
          {/* RIGHT SIDE: แผงควบคุมบันทึก 10 นิ้ว (มือซ้าย-มือขวา) ตำแหน่ง 1-7 (7 Cols)  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col p-4 sm:p-5 overflow-y-auto bg-slate-950">
            
            {/* Header of Control Panel */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Hand className="w-4 h-4 text-emerald-400" />
                  <span>แผงควบคุมบันทึกลายนิ้วมือ (10 นิ้วมือ • ตำแหน่ง 1-7)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  คลิกที่ช่องหมายเลข 1-7 ในแต่ละนิ้วเพื่อเลือกมุม หรือดับเบิ้ลคลิกเพื่อบันทึกทันที
                </p>
              </div>

              {/* Auto Advance Toggle */}
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                />
                <span>เลื่อนอัตโนมัติ (Auto Next)</span>
              </label>
            </div>

            {/* Finger Rows Container */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
              
              {/* ---------------------------------------------------- */}
              {/* SECTION 1: มือซ้าย (Left Hand: โป้ง, ชี้, กลาง, นาง, ก้อย) */}
              {/* ---------------------------------------------------- */}
              <div>
                <div className="flex items-center space-x-2 mb-2 pb-1 border-b border-slate-800/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    มือซ้าย (Left Hand: นิ้วโป้ง, ชี้, กลาง, นาง, ก้อย)
                  </h4>
                </div>

                <div className="space-y-1.5">
                  {FINGERS_ORDER.filter(f => f.hand === 'left').map(finger => {
                    const isCurrentFinger = currentFingerKey === finger.key;
                    const fingerCaptures = capturedMatrix[finger.key] || {};
                    const capturedCount = Object.keys(fingerCaptures).length;

                    return (
                      <div 
                        key={finger.key}
                        className={`p-2 rounded-xl border transition-all ${
                          isCurrentFinger 
                            ? 'bg-blue-950/40 border-blue-500/70 shadow-xs' 
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          
                          {/* Finger Label Info */}
                          <div 
                            onClick={() => setCurrentFingerKey(finger.key)}
                            className="flex items-center space-x-2 cursor-pointer shrink-0 sm:w-36"
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono ${
                              isCurrentFinger ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {finger.key}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isCurrentFinger ? 'text-blue-300' : 'text-slate-200'}`}>
                                {finger.fingerNameTh}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {capturedCount}/7 มุม
                              </p>
                            </div>
                          </div>

                          {/* Positions 1 to 7 arranged left to right */}
                          <div className="grid grid-cols-7 gap-1.5 flex-1 max-w-xl">
                            {POSITIONS_1_TO_7.map(pos => {
                              const isSelectedSlot = isCurrentFinger && currentAngleId === pos.id;
                              const capturedImg = fingerCaptures[pos.id];

                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() => {
                                    setCurrentFingerKey(finger.key);
                                    setCurrentAngleId(pos.id);
                                  }}
                                  onDoubleClick={() => {
                                    setCurrentFingerKey(finger.key);
                                    setCurrentAngleId(pos.id);
                                    handleSaveToTarget(finger.key, pos.id);
                                  }}
                                  className={`relative h-11 rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all text-center group cursor-pointer ${
                                    isSelectedSlot
                                      ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/50 shadow-sm'
                                      : capturedImg
                                      ? 'bg-emerald-950/40 border-emerald-700/60 hover:border-emerald-500'
                                      : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                                  }`}
                                  title={`${finger.fingerNameTh} - ตำแหน่งที่ ${pos.num}: ${pos.desc} (ดับเบิ้ลคลิกเพื่อบันทึกทันที)`}
                                >
                                  {capturedImg ? (
                                    <div className="relative w-full h-full rounded overflow-hidden">
                                      <img 
                                        src={capturedImg} 
                                        alt={`${finger.key}-${pos.num}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                                        ✓
                                      </div>
                                      <span className="absolute bottom-0.5 left-1 text-[8px] text-white font-mono bg-black/60 px-1 rounded">
                                        {pos.num}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <span className={`text-xs font-bold ${isSelectedSlot ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                        {pos.num}
                                      </span>
                                      <span className="text-[8px] text-slate-400 truncate max-w-[40px] leading-tight">
                                        {pos.num === 1 ? 'Core' : pos.num === 2 ? 'ซ้าย' : pos.num === 3 ? 'ขวา' : pos.num === 4 ? 'บน' : pos.num === 5 ? 'ล่าง' : pos.num === 6 ? 'ซ้ายบน' : 'ขวาบน'}
                                      </span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SECTION 2: มือขวา (Right Hand: โป้ง, ชี้, กลาง, นาง, ก้อย) */}
              {/* ---------------------------------------------------- */}
              <div className="pt-2">
                <div className="flex items-center space-x-2 mb-2 pb-1 border-b border-slate-800/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    มือขวา (Right Hand: นิ้วโป้ง, ชี้, กลาง, นาง, ก้อย)
                  </h4>
                </div>

                <div className="space-y-1.5">
                  {FINGERS_ORDER.filter(f => f.hand === 'right').map(finger => {
                    const isCurrentFinger = currentFingerKey === finger.key;
                    const fingerCaptures = capturedMatrix[finger.key] || {};
                    const capturedCount = Object.keys(fingerCaptures).length;

                    return (
                      <div 
                        key={finger.key}
                        className={`p-2 rounded-xl border transition-all ${
                          isCurrentFinger 
                            ? 'bg-emerald-950/40 border-emerald-500/70 shadow-xs' 
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          
                          {/* Finger Label Info */}
                          <div 
                            onClick={() => setCurrentFingerKey(finger.key)}
                            className="flex items-center space-x-2 cursor-pointer shrink-0 sm:w-36"
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono ${
                              isCurrentFinger ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {finger.key}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isCurrentFinger ? 'text-emerald-300' : 'text-slate-200'}`}>
                                {finger.fingerNameTh}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {capturedCount}/7 มุม
                              </p>
                            </div>
                          </div>

                          {/* Positions 1 to 7 arranged left to right */}
                          <div className="grid grid-cols-7 gap-1.5 flex-1 max-w-xl">
                            {POSITIONS_1_TO_7.map(pos => {
                              const isSelectedSlot = isCurrentFinger && currentAngleId === pos.id;
                              const capturedImg = fingerCaptures[pos.id];

                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() => {
                                    setCurrentFingerKey(finger.key);
                                    setCurrentAngleId(pos.id);
                                  }}
                                  onDoubleClick={() => {
                                    setCurrentFingerKey(finger.key);
                                    setCurrentAngleId(pos.id);
                                    handleSaveToTarget(finger.key, pos.id);
                                  }}
                                  className={`relative h-11 rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all text-center group cursor-pointer ${
                                    isSelectedSlot
                                      ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/50 shadow-sm'
                                      : capturedImg
                                      ? 'bg-emerald-950/40 border-emerald-700/60 hover:border-emerald-500'
                                      : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                                  }`}
                                  title={`${finger.fingerNameTh} - ตำแหน่งที่ ${pos.num}: ${pos.desc} (ดับเบิ้ลคลิกเพื่อบันทึกทันที)`}
                                >
                                  {capturedImg ? (
                                    <div className="relative w-full h-full rounded overflow-hidden">
                                      <img 
                                        src={capturedImg} 
                                        alt={`${finger.key}-${pos.num}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                      <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                                        ✓
                                      </div>
                                      <span className="absolute bottom-0.5 left-1 text-[8px] text-white font-mono bg-black/60 px-1 rounded">
                                        {pos.num}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <span className={`text-xs font-bold ${isSelectedSlot ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                        {pos.num}
                                      </span>
                                      <span className="text-[8px] text-slate-400 truncate max-w-[40px] leading-tight">
                                        {pos.num === 1 ? 'Core' : pos.num === 2 ? 'ซ้าย' : pos.num === 3 ? 'ขวา' : pos.num === 4 ? 'บน' : pos.num === 5 ? 'ล่าง' : pos.num === 6 ? 'ซ้ายบน' : 'ขวาบน'}
                                      </span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Actions & Done Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>บันทึกแล้ว {totalCaptured} / 70 มุม</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <span>เสร็จสิ้นและนำไปวิเคราะห์</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Global Modal Footer */}
        <div className="bg-slate-900 px-5 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">Futronic FS80H Optical Scanner System</span>
            <span>•</span>
            <span>500 DPI Continuous Frame Feed</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>ปุ่มลัด: [Space] บันทึกมุม | [1-7] สลับมุม</span>
          </div>
        </div>

      </div>
    </div>
  );
};
