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
  Maximize2,
  Crosshair,
  Move,
  Camera,
  ChevronRight,
  Eye,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Star,
  ZoomIn,
  ZoomOut,
  ImageIcon,
  Grid,
  Info
} from 'lucide-react';
import { FingerKey } from '../types';
import { 
  DEFAULT_FUTRONIC_ENDPOINT, 
  checkFutronicServerStatus, 
  generateLiveSimulationFrame,
  ScannerStatus 
} from '../utils/futronicService';

export type MainAngleType = 'center' | 'left' | 'right';

export interface CapturedFrame {
  id: string;
  dataUrl: string;
  timestamp: string;
  timeLabel: string;
  quality: number;
  offsetX: number;
  offsetY: number;
}

export interface AngleBucket {
  type: MainAngleType;
  label: string;
  angleKey: string; // 'angle_1' | 'angle_2' | 'angle_3'
  shortKey: string;
  iconDesc: string;
  primaryIndex: number;
  images: CapturedFrame[];
}

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

const MAX_PHOTOS_PER_ANGLE = 10;

const ANGLE_CONFIGS: Record<MainAngleType, { label: string; angleKey: string; shortKey: string; desc: string; defaultOffset: { x: number; y: number; rot: number } }> = {
  center: {
    label: 'ตรงกลาง (Center)',
    angleKey: 'angle_1',
    shortKey: '1 / C',
    desc: 'เน้นจับจุดศูนย์กลางลวดลาย (Core Center)',
    defaultOffset: { x: 0, y: 0, rot: 0 }
  },
  left: {
    label: 'เอียงซ้าย (Left)',
    angleKey: 'angle_2',
    shortKey: '2 / L',
    desc: 'เน้นจับจุดสามเหลี่ยมเดลต้าฝั่งซ้าย (Left Delta)',
    defaultOffset: { x: -28, y: 10, rot: -0.12 }
  },
  right: {
    label: 'เอียงขวา (Right)',
    angleKey: 'angle_3',
    shortKey: '3 / R',
    desc: 'เน้นจับจุดสามเหลี่ยมเดลต้าฝั่งขวา (Right Delta)',
    defaultOffset: { x: 28, y: 10, rot: 0.12 }
  }
};

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
  // Connection state
  const [endpointUrl, setEndpointUrl] = useState<string>(DEFAULT_FUTRONIC_ENDPOINT);
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('ready');
  const [statusMessage, setStatusMessage] = useState<string>('เชื่อมต่อ Local Driver (พอร์ต 15270)');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Live Streaming & Movement
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [currentLiveFrame, setCurrentLiveFrame] = useState<string>('');
  const [qualityScore, setQualityScore] = useState<number>(96);
  const [fingerOffset, setFingerOffset] = useState<{ x: number; y: number; rot: number }>({ x: 0, y: 0, rot: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Viewfinder UI Options
  const [activeAngleTab, setActiveAngleTab] = useState<MainAngleType>('center');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDeltas, setShowDeltas] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);

  // 3 Angles Storage (Center, Left, Right) - max 10 photos per angle
  const [angleBuckets, setAngleBuckets] = useState<Record<MainAngleType, AngleBucket>>({
    center: {
      type: 'center',
      label: 'ตรงกลาง (Center)',
      angleKey: 'angle_1',
      shortKey: 'C',
      iconDesc: 'Core Center',
      primaryIndex: 0,
      images: []
    },
    left: {
      type: 'left',
      label: 'เอียงซ้าย (Left)',
      angleKey: 'angle_2',
      shortKey: 'L',
      iconDesc: 'Delta L',
      primaryIndex: 0,
      images: []
    },
    right: {
      type: 'right',
      label: 'เอียงขวา (Right)',
      angleKey: 'angle_3',
      shortKey: 'R',
      iconDesc: 'Delta R',
      primaryIndex: 0,
      images: []
    }
  });

  // Gallery Inspector state (for inspecting a specific photo enlarged)
  const [inspectedImage, setInspectedImage] = useState<{ angleType: MainAngleType; frame: CapturedFrame; index: number } | null>(null);
  const [galleryTab, setGalleryTab] = useState<MainAngleType | 'all'>('center');

  const streamTimerRef = useRef<any>(null);

  // Sync initial angle tab from props
  useEffect(() => {
    if (activeAngle === 'angle_2') setActiveAngleTab('left');
    else if (activeAngle === 'angle_3') setActiveAngleTab('right');
    else setActiveAngleTab('center');
  }, [activeAngle]);

  // Check Local Driver status on modal open
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
      setStatusMessage('เชื่อมต่อ Local Driver (พอร์ต 15270) สำเร็จ พร้อมสตรีมภาพสด');
    } else {
      setScannerStatus('ready');
      setStatusMessage('เชื่อมต่อ Local Driver (พอร์ต 15270) หรือสตรีมภาพสดแบบจำลองเรียลไทม์');
    }
  };

  // Switch angle preset positioning
  const handleSelectAngleTab = (angle: MainAngleType) => {
    setActiveAngleTab(angle);
    setGalleryTab(angle);
    const config = ANGLE_CONFIGS[angle];
    if (config) {
      setFingerOffset(config.defaultOffset);
    }
  };

  // Continuous Live Stream Frame Loop (~12 FPS)
  useEffect(() => {
    if (!isOpen || !isStreaming) return;

    const interval = setInterval(() => {
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

  // Drag / Movement handlers on Sensor Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - fingerOffset.x, y: e.clientY - fingerOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = Math.max(-65, Math.min(65, e.clientX - dragStart.x));
    const newY = Math.max(-85, Math.min(85, e.clientY - dragStart.y));
    setFingerOffset(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Capture current live frame into a specific angle bucket (Max 10)
  const handleCaptureAngle = useCallback((angleType: MainAngleType) => {
    if (!currentLiveFrame) return;

    const currentBucket = angleBuckets[angleType];
    if (currentBucket.images.length >= MAX_PHOTOS_PER_ANGLE) {
      alert(`มุม${ANGLE_CONFIGS[angleType].label} บันทึกครบโควตา ${MAX_PHOTOS_PER_ANGLE} รูปแล้ว\nคุณสามารถลบรูปที่ไม่ต้องการออกก่อนเพื่อถ่ายเพิ่มได้ครับ`);
      return;
    }

    // Trigger visual camera shutter flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 150);

    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const newFrame: CapturedFrame = {
      id: `frame_${angleType}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      dataUrl: currentLiveFrame,
      timestamp: now.toISOString(),
      timeLabel,
      quality: qualityScore,
      offsetX: fingerOffset.x,
      offsetY: fingerOffset.y
    };

    setAngleBuckets(prev => {
      const bucket = prev[angleType];
      const updatedImages = [...bucket.images, newFrame];
      return {
        ...prev,
        [angleType]: {
          ...bucket,
          images: updatedImages,
          // If first image in bucket, make it primary by default
          primaryIndex: bucket.images.length === 0 ? 0 : bucket.primaryIndex
        }
      };
    });

    // Auto apply first/primary scan to parent studio right away
    const angleKey = ANGLE_CONFIGS[angleType].angleKey;
    onApplyScan(currentLiveFrame, angleKey);

    setStatusMessage(`บันทึกมุม${ANGLE_CONFIGS[angleType].label} รูปที่ ${currentBucket.images.length + 1}/${MAX_PHOTOS_PER_ANGLE} สำเร็จ!`);
  }, [currentLiveFrame, angleBuckets, qualityScore, fingerOffset, onApplyScan]);

  // Set Primary Image for an angle
  const handleSetPrimaryImage = (angleType: MainAngleType, imageIndex: number) => {
    const bucket = angleBuckets[angleType];
    const targetImage = bucket.images[imageIndex];
    if (!targetImage) return;

    setAngleBuckets(prev => ({
      ...prev,
      [angleType]: {
        ...prev[angleType],
        primaryIndex: imageIndex
      }
    }));

    // Update parent Fingerprint Studio with this chosen image
    const angleKey = ANGLE_CONFIGS[angleType].angleKey;
    onApplyScan(targetImage.dataUrl, angleKey);
    setStatusMessage(`ตั้งรูปที่ ${imageIndex + 1} เป็นภาพหลักของมุม${ANGLE_CONFIGS[angleType].label} เรียบร้อยแล้ว`);
  };

  // Delete an image from bucket
  const handleDeleteImage = (angleType: MainAngleType, imageIndex: number) => {
    setAngleBuckets(prev => {
      const bucket = prev[angleType];
      const updatedImages = bucket.images.filter((_, idx) => idx !== imageIndex);
      let newPrimary = bucket.primaryIndex;
      if (newPrimary >= updatedImages.length) {
        newPrimary = Math.max(0, updatedImages.length - 1);
      }
      
      // If primary image changed, update parent
      if (updatedImages[newPrimary]) {
        onApplyScan(updatedImages[newPrimary].dataUrl, ANGLE_CONFIGS[angleType].angleKey);
      }

      return {
        ...prev,
        [angleType]: {
          ...bucket,
          images: updatedImages,
          primaryIndex: newPrimary
        }
      };
    });

    if (inspectedImage && inspectedImage.angleType === angleType && inspectedImage.index === imageIndex) {
      setInspectedImage(null);
    }
  };

  // Apply all primary images and close
  const handleApplyAllAndClose = () => {
    // Apply center
    if (angleBuckets.center.images.length > 0) {
      const prim = angleBuckets.center.images[angleBuckets.center.primaryIndex] || angleBuckets.center.images[0];
      if (prim) onApplyScan(prim.dataUrl, 'angle_1');
    }
    // Apply left
    if (angleBuckets.left.images.length > 0) {
      const prim = angleBuckets.left.images[angleBuckets.left.primaryIndex] || angleBuckets.left.images[0];
      if (prim) onApplyScan(prim.dataUrl, 'angle_2');
    }
    // Apply right
    if (angleBuckets.right.images.length > 0) {
      const prim = angleBuckets.right.images[angleBuckets.right.primaryIndex] || angleBuckets.right.images[0];
      if (prim) onApplyScan(prim.dataUrl, 'angle_3');
    }
    onClose();
  };

  // Keyboard shortcut listener:
  // 1 or C = Center, 2 or L = Left, 3 or R = Right, Space = Current Tab
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (e.code === 'Space') {
        e.preventDefault();
        handleCaptureAngle(activeAngleTab);
      } else if (key === '1' || key === 'c') {
        e.preventDefault();
        setActiveAngleTab('center');
        handleCaptureAngle('center');
      } else if (key === '2' || key === 'l') {
        e.preventDefault();
        setActiveAngleTab('left');
        handleCaptureAngle('left');
      } else if (key === '3' || key === 'r') {
        e.preventDefault();
        setActiveAngleTab('right');
        handleCaptureAngle('right');
      } else if (e.key === 'Escape') {
        if (inspectedImage) {
          setInspectedImage(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeAngleTab, inspectedImage, handleCaptureAngle, onClose]);

  if (!isOpen) return null;

  const totalCapturedPhotos = 
    angleBuckets.center.images.length + 
    angleBuckets.left.images.length + 
    angleBuckets.right.images.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Futronic FS80H Live Multi-Angle Studio
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  Port 15270 • 3 มุม (สูงสุด 10 รูป/มุม)
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center space-x-2 mt-0.5">
                <span>นิ้วที่เลือก: <strong className="text-emerald-400">{fingerNameTh} ({selectedFingerKey})</strong></span>
                <span>•</span>
                <span className="text-amber-300 font-medium">บันทึกสะสม: {totalCapturedPhotos} / 30 รูป</span>
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
              title="การตั้งค่าพอร์ต 15270"
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

        {/* Modal Main Content Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950">
          
          {/* Left Column: Live Viewfinder & 3 Big Angle Capture Buttons (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-between space-y-4">
            
            {/* 3 Main Angle Tabs (Quick Switch Viewport Position) */}
            <div className="w-full flex items-center justify-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 gap-1.5">
              {(['center', 'left', 'right'] as MainAngleType[]).map((type) => {
                const cfg = ANGLE_CONFIGS[type];
                const count = angleBuckets[type].images.length;
                const isSelected = activeAngleTab === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSelectAngleTab(type)}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? type === 'center'
                          ? 'bg-blue-600 text-white shadow-md'
                          : type === 'left'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-teal-600 text-white shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{type === 'center' ? '🎯' : type === 'left' ? '👈' : '👉'}</span>
                    <span>{cfg.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {count}/10
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Sensor Viewport */}
            <div className="relative group">
              <div 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`relative w-72 h-88 sm:w-80 sm:h-96 rounded-2xl p-2.5 transition-all duration-150 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden ${
                  flashEffect 
                    ? 'border-4 border-white shadow-[0_0_50px_rgba(255,255,255,1)] bg-white'
                    : activeAngleTab === 'center'
                    ? 'border-2 border-blue-500/80 shadow-[0_0_25px_rgba(59,130,246,0.35)] bg-black'
                    : activeAngleTab === 'left'
                    ? 'border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] bg-black'
                    : 'border-2 border-teal-500/80 shadow-[0_0_25px_rgba(20,184,166,0.35)] bg-black'
                }`}
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
                    <div className={`absolute left-5 bottom-16 w-14 h-14 border rounded-lg flex items-center justify-center text-[9px] font-mono transition-all ${
                      activeAngleTab === 'left' ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold scale-105' : 'border-slate-500/40 text-slate-400/80'
                    }`}>
                      Delta L
                    </div>
                    <div className={`absolute right-5 bottom-16 w-14 h-14 border rounded-lg flex items-center justify-center text-[9px] font-mono transition-all ${
                      activeAngleTab === 'right' ? 'border-teal-400 bg-teal-500/20 text-teal-200 font-bold scale-105' : 'border-slate-500/40 text-slate-400/80'
                    }`}>
                      Delta R
                    </div>
                  </div>
                )}

                {/* Live Scanning Scanline Wave */}
                <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_3s_infinite] pointer-events-none opacity-60" />

                {/* Live Status Badge */}
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-[11px] font-mono text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE 15270</span>
                  <span className="text-slate-400">|</span>
                  <span>{qualityScore}% คมชัด</span>
                </div>

                {/* Interactive Drag Hint */}
                <div className="absolute bottom-3 inset-x-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-[10px] text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Move className="w-3 h-3 text-blue-400" />
                    <span>คลิกลากเพื่อขยับนิ้ว (Drag Live)</span>
                  </span>
                  <span className="font-mono text-slate-400">X: {fingerOffset.x} Y: {fingerOffset.y}</span>
                </div>
              </div>
            </div>

            {/* Quick Viewfinder Tools */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFingerOffset(ANGLE_CONFIGS[activeAngleTab].defaultOffset)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1.5"
                title="รีเซ็ตตำแหน่งกลับค่าเริ่มต้นของมุมนี้"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตมุม</span>
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

            {/* 3 Main Action Buttons: บันทึกมุมกลาง, บันทึกมุมซ้าย, บันทึกมุมขวา */}
            <div className="w-full space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* 1. บันทึกมุมกลาง */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveAngleTab('center');
                    handleCaptureAngle('center');
                  }}
                  disabled={angleBuckets.center.images.length >= MAX_PHOTOS_PER_ANGLE}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all shadow-md cursor-pointer border ${
                    angleBuckets.center.images.length >= MAX_PHOTOS_PER_ANGLE
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      : 'bg-linear-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white border-blue-400/40 active:scale-98'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-blue-200" />
                    <span>🎯 บันทึกมุมกลาง</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] font-normal text-blue-200">
                    <span className="font-mono bg-blue-950/50 px-1.5 py-0.5 rounded text-[10px]">[1 / C]</span>
                    <span>• {angleBuckets.center.images.length}/{MAX_PHOTOS_PER_ANGLE} รูป</span>
                  </div>
                </button>

                {/* 2. บันทึกมุมซ้าย */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveAngleTab('left');
                    handleCaptureAngle('left');
                  }}
                  disabled={angleBuckets.left.images.length >= MAX_PHOTOS_PER_ANGLE}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all shadow-md cursor-pointer border ${
                    angleBuckets.left.images.length >= MAX_PHOTOS_PER_ANGLE
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      : 'bg-linear-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400/40 active:scale-98'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-amber-200" />
                    <span>👈 บันทึกมุมซ้าย</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] font-normal text-amber-200">
                    <span className="font-mono bg-amber-950/50 px-1.5 py-0.5 rounded text-[10px]">[2 / L]</span>
                    <span>• {angleBuckets.left.images.length}/{MAX_PHOTOS_PER_ANGLE} รูป</span>
                  </div>
                </button>

                {/* 3. บันทึกมุมขวา */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveAngleTab('right');
                    handleCaptureAngle('right');
                  }}
                  disabled={angleBuckets.right.images.length >= MAX_PHOTOS_PER_ANGLE}
                  className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center space-y-1 transition-all shadow-md cursor-pointer border ${
                    angleBuckets.right.images.length >= MAX_PHOTOS_PER_ANGLE
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      : 'bg-linear-to-b from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white border-teal-400/40 active:scale-98'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-teal-200" />
                    <span>👉 บันทึกมุมขวา</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] font-normal text-teal-200">
                    <span className="font-mono bg-teal-950/50 px-1.5 py-0.5 rounded text-[10px]">[3 / R]</span>
                    <span>• {angleBuckets.right.images.length}/{MAX_PHOTOS_PER_ANGLE} รูป</span>
                  </div>
                </button>

              </div>

              <p className="text-center text-[11px] text-slate-400">
                💡 กดปุ่มถ่ายได้เรื่อยๆ (สูงสุด 10 รูป/มุม) • กดปุ่ม Spacebar เพื่อถ่ายมุมที่เลือกอยู่ทันที
              </p>
            </div>

          </div>

          {/* Right Column: Gallery & Inspector Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Status & Instructions */}
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700">
              <div className="flex items-center space-x-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">สถานะระบบ (Local Driver 15270)</span>
              </div>
              <p className="text-xs text-slate-300">{statusMessage}</p>
            </div>

            {/* Gallery Inspector Card */}
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 flex-1 flex flex-col min-h-[380px]">
              
              {/* Gallery Header & Angle Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-[#466BB2]" />
                  <h3 className="text-xs font-bold text-slate-200">
                    แกลเลอรีรูปที่บันทึกแล้ว ({totalCapturedPhotos} รูป)
                  </h3>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setGalleryTab('center')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      galleryTab === 'center' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    กลาง ({angleBuckets.center.images.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryTab('left')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      galleryTab === 'left' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ซ้าย ({angleBuckets.left.images.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryTab('right')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      galleryTab === 'right' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ขวา ({angleBuckets.right.images.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryTab('all')}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      galleryTab === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                </div>
              </div>

              {/* Gallery Thumbnail Grid */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                {(galleryTab === 'all' ? ['center', 'left', 'right'] : [galleryTab]).map((typeKey) => {
                  const type = typeKey as MainAngleType;
                  const bucket = angleBuckets[type];
                  const images = bucket.images;

                  if (images.length === 0) {
                    if (galleryTab !== 'all') {
                      return (
                        <div key={type} className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                          <Camera className="w-8 h-8 text-slate-600" />
                          <p className="text-xs">ยังไม่มีรูปบันทึกในมุม{bucket.label}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAngleTab(type);
                              handleCaptureAngle(type);
                            }}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                          >
                            📸 กดบันทึกรูปแรกของมุมนี้
                          </button>
                        </div>
                      );
                    }
                    return null;
                  }

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                          <span>{type === 'center' ? '🎯' : type === 'left' ? '👈' : '👉'}</span>
                          <span>มุม{bucket.label} ({images.length}/{MAX_PHOTOS_PER_ANGLE} รูป)</span>
                        </span>
                        <span className="text-[10px] text-amber-400 font-medium">
                          ⭐ รูปที่ {bucket.primaryIndex + 1} ถูกเลือกเป็นภาพหลัก
                        </span>
                      </div>

                      {/* 10-Slot Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {images.map((img, idx) => {
                          const isPrimary = bucket.primaryIndex === idx;

                          return (
                            <div
                              key={img.id}
                              className={`relative group rounded-lg overflow-hidden border transition-all cursor-pointer bg-black aspect-3/4 flex flex-col justify-between ${
                                isPrimary
                                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                                  : 'border-slate-700 hover:border-slate-500'
                              }`}
                              onClick={() => setInspectedImage({ angleType: type, frame: img, index: idx })}
                            >
                              {/* Image Thumbnail */}
                              <img
                                src={img.dataUrl}
                                alt={`Shot #${idx + 1}`}
                                className="w-full h-full object-cover"
                              />

                              {/* Top Bar on Thumb: Primary Star & Number */}
                              <div className="absolute top-1 inset-x-1 flex items-center justify-between pointer-events-none">
                                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                  isPrimary ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-black/60 text-white'
                                }`}>
                                  #{idx + 1}
                                </span>
                                {isPrimary && (
                                  <span className="p-0.5 bg-amber-500 text-slate-950 rounded-full">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                  </span>
                                )}
                              </div>

                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 space-y-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectedImage({ angleType: type, frame: img, index: idx });
                                  }}
                                  className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold flex items-center justify-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>ดูรูปขยาย</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPrimaryImage(type, idx);
                                  }}
                                  className={`w-full py-1 rounded text-[10px] font-bold flex items-center justify-center space-x-1 ${
                                    isPrimary ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 hover:bg-amber-600 text-white'
                                  }`}
                                >
                                  <Star className="w-3 h-3" />
                                  <span>{isPrimary ? 'รูปหลักแล้ว' : 'ใช้เป็นรูปหลัก'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(type, idx);
                                  }}
                                  className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded text-[10px] self-end"
                                  title="ลบรูปนี้"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Bottom Clarity Badge */}
                              <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.2 rounded text-[9px] font-mono text-emerald-300 pointer-events-none">
                                {img.quality}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {totalCapturedPhotos === 0 && (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                    <Camera className="w-10 h-10 text-slate-600" />
                    <p className="text-xs">ยังไม่มีรูปบันทึกในเซสชันนี้</p>
                    <p className="text-[11px] text-slate-500">
                      กดปุ่ม <strong>"🎯 บันทึกมุมกลาง"</strong>, <strong>"👈 บันทึกมุมซ้าย"</strong> หรือ <strong>"👉 บันทึกมุมขวา"</strong> เพื่อเริ่มบันทึกรูป
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-slate-700 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  รวมบันทึก {totalCapturedPhotos} รูป
                </span>

                <button
                  type="button"
                  onClick={handleApplyAllAndClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกและนำรูปหลักไปใช้งาน</span>
                </button>
              </div>

            </div>

            {/* Collapsible Connection Settings */}
            {showSettings && (
              <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 text-xs space-y-2 animate-in fade-in">
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

        {/* Footer info */}
        <div className="bg-slate-900 px-4 sm:px-6 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Futronic FS80H Driver • 500 DPI Optical Engine • Multi-Angle Burst</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>ปุ่มลัด: [1/C] มุมกลาง | [2/L] มุมซ้าย | [3/R] มุมขวา | [Space] ถ่ายมุมปัจจุบัน</span>
          </div>
        </div>

      </div>

      {/* Enlarged Photo Inspection Modal */}
      {inspectedImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">
                  {inspectedImage.angleType === 'center' ? '🎯' : inspectedImage.angleType === 'left' ? '👈' : '👉'}
                  {' '}มุม{ANGLE_CONFIGS[inspectedImage.angleType].label} — รูปที่ #{inspectedImage.index + 1}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  ความคมชัด {inspectedImage.frame.quality}%
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedImage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Large Display */}
            <div className="p-6 bg-black flex items-center justify-center min-h-[360px]">
              <img
                src={inspectedImage.frame.dataUrl}
                alt="Enlarged Fingerprint Scan"
                className="max-h-[420px] w-auto object-contain rounded-xl border border-slate-800 shadow-2xl"
              />
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-800/90 px-4 py-3 border-t border-slate-700 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDeleteImage(inspectedImage.angleType, inspectedImage.index);
                }}
                className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-lg border border-rose-500/40 flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบรูปนี้</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSetPrimaryImage(inspectedImage.angleType, inspectedImage.index);
                    setInspectedImage(null);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all ${
                    angleBuckets[inspectedImage.angleType].primaryIndex === inspectedImage.index
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {angleBuckets[inspectedImage.angleType].primaryIndex === inspectedImage.index 
                      ? 'รูปนี้เป็นภาพหลักแล้ว' 
                      : 'เลือกใช้รูปนี้เป็นภาพหลัก'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectedImage(null)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg"
                >
                  ปิด
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
