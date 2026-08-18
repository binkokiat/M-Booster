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
  Plus,
  Trash2,
  Cloud,
  CloudCheck,
  CloudOff
} from 'lucide-react';
import { FingerKey, FingerprintItem, RollPositionType } from '../types';
import { 
  DEFAULT_FUTRONIC_ENDPOINT, 
  checkFutronicServerStatus, 
  startHttpCapture, 
  generateContinuousLiveLoopFrame,
  generateSimulatedFS80HScan, 
  playCaptureChime,
  ScannerStatus 
} from '../utils/futronicService';
import { db, doc, setDoc, handleFirestoreError, OperationType } from '../firebase';

interface FutronicScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFingerKey: FingerKey;
  fingerNameTh: string;
  activeAngle: string;
  patternType?: string;
  clientId?: string;
  onApplyScan: (dataUrl: string, targetAngle?: string, targetFingerKey?: FingerKey) => void;
  onNextAngle?: () => void;
  existingFingerprints?: Record<FingerKey, FingerprintItem>;
  onBulkUpdateFingerprints?: (updated: Record<FingerKey, FingerprintItem>) => void;
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

// Physical Finger Rolling positions on FS80H scanner glass
export interface StandardPositionDef {
  id: string;
  type: RollPositionType;
  label: string;
  desc: string;
  shortLabel: string;
  guide: string;
}

const DEFAULT_STANDARD_POSITIONS: StandardPositionDef[] = [
  { id: 'core', type: 'core', label: '1. จุดกึ่งกลาง (Core)', desc: 'Core Center', shortLabel: 'Core', guide: 'วางกึ่งกลางนิ้วให้เห็นจุดศูนย์กลางชัดเจน' },
  { id: 'delta_left', type: 'delta_left', label: '2. พลิกซ้าย (Delta L)', desc: 'Delta Left', shortLabel: 'Delta L', guide: 'พลิกเอียงนิ้วด้านซ้ายแนบกระจกเพื่อจับจุดสามแยกซ้าย' },
  { id: 'delta_right', type: 'delta_right', label: '3. พลิกขวา (Delta R)', desc: 'Delta Right', shortLabel: 'Delta R', guide: 'พลิกเอียงนิ้วด้านขวาแนบกระจกเพื่อจับจุดสามแยกขวา' },
  { id: 'edge_top', type: 'edge_top', label: '4. พลิกสันบน (Top)', desc: 'Top Ridge', shortLabel: 'สันบน', guide: 'พลิกเก็บส่วนยอดปลายนิ้ว' },
  { id: 'edge_bottom', type: 'edge_bottom', label: '5. พลิกสันล่าง (Base)', desc: 'Base Ridge', shortLabel: 'สันล่าง', guide: 'พลิกเก็บส่วนข้อพับล่าง' },
];

export const FutronicScannerModal: React.FC<FutronicScannerModalProps> = ({
  isOpen,
  onClose,
  selectedFingerKey: initialFingerKey,
  activeAngle: initialActiveAngle,
  patternType = 'Wt',
  clientId = 'demo_client',
  onApplyScan,
  existingFingerprints,
  onBulkUpdateFingerprints
}) => {
  // Current active finger and position
  const [currentFingerKey, setCurrentFingerKey] = useState<FingerKey>(initialFingerKey || 'L1');
  const [currentAngleId, setCurrentAngleId] = useState<string>(initialActiveAngle || 'core');

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

  // Firebase Cloud Sync State
  const [firebaseSyncing, setFirebaseSyncing] = useState<boolean>(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'synced' | 'unsaved' | 'error'>('synced');
  const [firebaseMsg, setFirebaseMsg] = useState<string>('เชื่อมต่อ Firebase Firestore แล้ว');
  
  // Dynamic Fingerprint Matrix: Record<FingerKey, Record<string, { image: string; type: RollPositionType; label: string }>>
  const [capturedMatrix, setCapturedMatrix] = useState<Record<string, Record<string, { image: string; type: RollPositionType; label: string }>>>(() => {
    const init: Record<string, Record<string, { image: string; type: RollPositionType; label: string }>> = {};
    
    // Seed from existing fingerprints if available
    if (existingFingerprints) {
      Object.keys(existingFingerprints).forEach(fKey => {
        const finger = existingFingerprints[fKey as FingerKey];
        if (finger && finger.angles) {
          init[fKey] = {};
          Object.keys(finger.angles).forEach(angKey => {
            const angData = finger.angles[angKey];
            if (angData?.image) {
              const mappedId = angKey === 'angle_1' ? 'core' : 
                               angKey === 'angle_2' ? 'delta_left' : 
                               angKey === 'angle_3' ? 'delta_right' : 
                               angKey === 'angle_4' ? 'edge_top' : 
                               angKey === 'angle_5' ? 'edge_bottom' : angKey;
              init[fKey][mappedId] = {
                image: angData.image,
                type: angData.position_type || (mappedId as RollPositionType) || 'core',
                label: angData.position_label_th || mappedId
              };
            }
          });
        }
      });
    }
    
    // Ensure all 10 fingers exist
    FINGERS_ORDER.forEach(f => {
      if (!init[f.key]) {
        init[f.key] = {};
      }
    });

    return init;
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const frameLoopRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  // Current active finger definition
  const currentFingerDef = FINGERS_ORDER.find(f => f.key === currentFingerKey) || FINGERS_ORDER[0];
  const currentAngleDef = DEFAULT_STANDARD_POSITIONS.find(p => p.id === currentAngleId) || {
    id: currentAngleId,
    type: 'custom' as RollPositionType,
    label: `รูปเพิ่มเติม (${currentAngleId})`,
    desc: 'Custom Shot',
    shortLabel: currentAngleId,
    guide: 'พลิกเก็บมุมภาพเพิ่มเติมตามความเหมาะสม'
  };

  // Check Futronic FS80H Driver connection status
  const checkDriverStatus = useCallback(async () => {
    try {
      const isOnline = await checkFutronicServerStatus(endpointUrl);
      if (isOnline) {
        setScannerStatus('connected');
        setStatusMessage('ตรวจพบเครื่อง FS80H (พอร์ต 15270) พร้อมสแกน Continuous Frame');
        setFrameSource('real_hardware');
      } else {
        setScannerStatus('disconnected');
        setStatusMessage('ไม่พบ Local Driver พอร์ต 15270 (เข้าสู่โหมด Continuous Demo เพื่อทดลองงาน)');
        if (inputMode === 'hardware_fs80h') {
          // Keep hardware mode or fallback frame
        }
      }
    } catch {
      setScannerStatus('disconnected');
      setStatusMessage('ไม่พบสัญญาณ Local Driver พอร์ต 15270');
    }
  }, [endpointUrl, inputMode]);

  // Initial Boot check
  useEffect(() => {
    if (isOpen) {
      checkDriverStatus();
    }
  }, [isOpen, checkDriverStatus]);

  // Continuous Frame Loop Engine (Runs smoothly at 30 FPS)
  useEffect(() => {
    if (!isOpen) {
      if (frameLoopRef.current) cancelAnimationFrame(frameLoopRef.current);
      return;
    }

    let lastTime = performance.now();
    let frameRateCheck = performance.now();
    let framesThisSecond = 0;

    const renderLoop = (time: number) => {
      // Calculate FPS
      framesThisSecond++;
      if (time - frameRateCheck >= 1000) {
        setFpsCounter(framesThisSecond);
        framesThisSecond = 0;
        frameRateCheck = time;
      }

      // Update frame every ~33ms (30 FPS) for smooth viewfinder
      if (time - lastTime >= 33) {
        lastTime = time;
        frameCountRef.current++;

        if (inputMode === 'simulation') {
          // Generate realistic live continuous loop with finger rolling effect
          const simulatedFrame = generateContinuousLiveLoopFrame(
            frameCountRef.current,
            zoomLevel,
            invertImage,
            brightness,
            contrast
          );
          setCurrentFrame(simulatedFrame.dataUrl);
          setFrameSource('simulation');
        } else if (inputMode === 'hardware_fs80h' && scannerStatus !== 'connected') {
          // Fallback simulation frame to allow user to experience the live viewport
          const simulatedFrame = generateContinuousLiveLoopFrame(
            frameCountRef.current,
            zoomLevel,
            invertImage,
            brightness,
            contrast
          );
          setCurrentFrame(simulatedFrame.dataUrl);
        }
      }

      frameLoopRef.current = requestAnimationFrame(renderLoop);
    };

    frameLoopRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (frameLoopRef.current) {
        cancelAnimationFrame(frameLoopRef.current);
      }
    };
  }, [isOpen, inputMode, scannerStatus, patternType, currentAngleId]);

  // Camera start / stop lifecycle
  useEffect(() => {
    if (inputMode === 'camera' && isOpen) {
      navigator.mediaDevices?.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 640 },
          facingMode: 'environment' 
        } 
      })
      .then(stream => {
        setCameraStream(stream);
        setIsCameraActive(true);
        setFrameSource('real_camera');
        setStatusMessage('กล้องพร้อมใช้งาน - ส่องนิ้วลงบนกรอบเพื่อถ่ายภาพ');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Camera access error:', err);
        setStatusMessage('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการเข้าถึงกล้อง');
      });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setIsCameraActive(false);
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [inputMode, isOpen]);

  // Save scan snapshot into specific finger and position
  const handleSaveToTarget = (targetFingerKey: FingerKey, targetPositionId: string, imageToSave?: string) => {
    const frameData = imageToSave || currentFrame || generateSimulatedFS80HScan(targetFingerKey, patternType, 1).dataUrl;
    if (!frameData) return;

    if (soundEnabled) {
      playCaptureChime();
    }

    const posDef = DEFAULT_STANDARD_POSITIONS.find(p => p.id === targetPositionId);
    const posType = posDef?.type || 'custom';
    const posLabel = posDef?.label || targetPositionId;

    setCapturedMatrix(prev => {
      const updated = { ...prev };
      if (!updated[targetFingerKey]) {
        updated[targetFingerKey] = {};
      }
      updated[targetFingerKey] = {
        ...updated[targetFingerKey],
        [targetPositionId]: {
          image: frameData,
          type: posType,
          label: posLabel
        }
      };
      return updated;
    });

    setFirebaseStatus('unsaved');

    // Notify parent studio
    onApplyScan(frameData, targetPositionId, targetFingerKey);

    // Auto Advance to next position / finger if enabled
    if (autoAdvance) {
      const standardIds = DEFAULT_STANDARD_POSITIONS.map(p => p.id);
      const currentIdx = standardIds.indexOf(targetPositionId);

      if (currentIdx !== -1 && currentIdx < 2) {
        // Move from Core -> Delta L -> Delta R
        setCurrentAngleId(standardIds[currentIdx + 1]);
      } else {
        // Advance to next finger's Core
        const fingerIdx = FINGERS_ORDER.findIndex(f => f.key === targetFingerKey);
        if (fingerIdx !== -1 && fingerIdx < FINGERS_ORDER.length - 1) {
          const nextFinger = FINGERS_ORDER[fingerIdx + 1];
          setCurrentFingerKey(nextFinger.key);
          setCurrentAngleId('core');
        }
      }
    }
  };

  // Delete a specific captured shot from a finger
  const handleDeleteShot = (targetFingerKey: FingerKey, positionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCapturedMatrix(prev => {
      const updated = { ...prev };
      if (updated[targetFingerKey]) {
        const fingerShots = { ...updated[targetFingerKey] };
        delete fingerShots[positionId];
        updated[targetFingerKey] = fingerShots;
      }
      return updated;
    });
    setFirebaseStatus('unsaved');
  };

  // Add custom extra shot to a finger
  const handleAddCustomShot = (targetFingerKey: FingerKey) => {
    const existingShots = capturedMatrix[targetFingerKey] || {};
    const customCount = Object.keys(existingShots).filter(k => k.startsWith('extra_')).length + 1;
    const newId = `extra_${customCount}`;
    setCurrentFingerKey(targetFingerKey);
    setCurrentAngleId(newId);
  };

  // Direct Hardware Scan Trigger
  const handleHardwareScan = async () => {
    setIsHardwareScanning(true);
    setStatusMessage('กำลังเชื่อมต่อและรับภาพลายนิ้วมือ 500 DPI จาก FS80H...');
    try {
      const result = await startHttpCapture(endpointUrl);
      if (result && result.dataUrl) {
        setCurrentFrame(result.dataUrl);
        setFrameSource('real_hardware');
        setScannerStatus('success');
        setStatusMessage('สแกนภาพจากเครื่อง FS80H สำเร็จเรียบร้อย');
        handleSaveToTarget(currentFingerKey, currentAngleId, result.dataUrl);
      } else {
        setStatusMessage('ไม่พบภาพจากเครื่อง FS80H (ตรวจเช็คการวางนิ้วและสาย USB)');
      }
    } catch {
      setStatusMessage('การเชื่อมต่อกับ FS80H ขัดข้อง');
    } finally {
      setIsHardwareScanning(false);
    }
  };

  // Capture from live camera
  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCurrentFrame(dataUrl);
    setFrameSource('real_camera');
    handleSaveToTarget(currentFingerKey, currentAngleId, dataUrl);
  };

  // Spacebar capture & Keyboard 1-5 shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar = Capture Current Frame into selected slot
      if (e.code === 'Space') {
        e.preventDefault();
        handleSaveToTarget(currentFingerKey, currentAngleId);
      }
      // 1 to 5 = Switch standard rolling position
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= DEFAULT_STANDARD_POSITIONS.length) {
          setCurrentAngleId(DEFAULT_STANDARD_POSITIONS[num - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentFingerKey, currentAngleId, currentFrame, autoAdvance, soundEnabled]);

  // Upload File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCurrentFrame(dataUrl);
        setFrameSource('real_upload');
        handleSaveToTarget(currentFingerKey, currentAngleId, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Paste Image from Clipboard
  const handlePasteImage = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
              setCurrentFrame(dataUrl);
              setFrameSource('real_upload');
              handleSaveToTarget(currentFingerKey, currentAngleId, dataUrl);
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      alert('ไม่พบรูปภาพในคลิปบอร์ด กรุณากดคัดลอกรูปภาพแล้วลองใหม่อีกครั้ง');
    } catch {
      alert('กรุณากดอนุญาตการอ่านคลิปบอร์ดในเบราว์เซอร์');
    }
  };

  // Save all captured matrix to Firebase Firestore
  const handleSaveToFirebase = async () => {
    setFirebaseSyncing(true);
    setFirebaseMsg('กำลังบันทึกลายนิ้วมือขึ้น Firebase Firestore...');
    try {
      const scanDocRef = doc(db, 'scans', clientId || `scan_${Date.now()}`);
      
      // Structure clean payload
      const payload: Record<string, any> = {
        client_id: clientId,
        updated_at: new Date().toISOString(),
        device: 'Futronic FS80H Optical Scanner (500 DPI)',
        fingerprints: {}
      };

      Object.keys(capturedMatrix).forEach(fKey => {
        const fingerData = capturedMatrix[fKey];
        if (fingerData && Object.keys(fingerData).length > 0) {
          payload.fingerprints[fKey] = {
            shots_count: Object.keys(fingerData).length,
            shots: fingerData
          };
        }
      });

      await setDoc(scanDocRef, payload, { merge: true });
      
      setFirebaseStatus('synced');
      setFirebaseMsg('บันทึกข้อมูลขึ้น Firebase Firestore เรียบร้อยแล้ว (Realtime Sync)');
      
      // Also update client record status
      const clientDocRef = doc(db, 'clients', clientId);
      await setDoc(clientDocRef, {
        latest_modified: new Date().toISOString(),
        has_scans: true
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `scans/${clientId}`);
      setFirebaseStatus('error');
      setFirebaseMsg('การบันทึก Firebase ขัดข้อง (ดูรายละเอียดในคอนโซล)');
    } finally {
      setFirebaseSyncing(false);
    }
  };

  // Mode Switch
  const handleModeChange = (mode: 'hardware_fs80h' | 'camera' | 'upload' | 'simulation') => {
    setInputMode(mode);
    if (mode === 'hardware_fs80h') {
      checkDriverStatus();
    } else if (mode === 'simulation') {
      setFrameSource('simulation');
      setStatusMessage('Continuous Frame Loop Simulation (30 FPS)');
    }
  };

  // Calculate total captured photos across all fingers
  const totalCaptured = Object.values(capturedMatrix).reduce((acc: number, curr) => acc + (curr ? Object.keys(curr).length : 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  สถานีสแกนลายนิ้วมือ Futronic FS80H
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  Continuous Frame Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2">
                <span>พลิกนิ้วบนกระจกสแกนเพื่อจับ <strong>Core</strong> และ <strong>Delta</strong> (แต่ละนิ้วปรับจำนวนรูปได้อิสระ)</span>
              </p>
            </div>
          </div>

          {/* Top Right Controls & Firebase Status */}
          <div className="flex items-center space-x-2">
            
            {/* Firebase Sync Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
              <span className={`w-2 h-2 rounded-full ${firebaseStatus === 'synced' ? 'bg-emerald-400' : firebaseStatus === 'unsaved' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300 font-mono text-[11px]">
                {firebaseStatus === 'synced' ? 'Firebase Synced' : firebaseStatus === 'unsaved' ? 'Unsaved (กดบันทึก)' : 'Sync Error'}
              </span>
            </div>

            {/* Save to Firebase Button */}
            <button
              type="button"
              onClick={handleSaveToFirebase}
              disabled={firebaseSyncing}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="บันทึกภาพลายนิ้วมือทั้งหมดขึ้น Firebase Firestore"
            >
              <Cloud className={`w-3.5 h-3.5 ${firebaseSyncing ? 'animate-bounce' : ''}`} />
              <span>{firebaseSyncing ? 'กำลังบันทึก...' : 'บันทึกลง Firebase'}</span>
            </button>

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

        {/* Modal Main Split: Left Side (Continuous Frame Viewfinder) | Right Side (10 Fingers & Dynamic Shots) */}
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
                    <span className="absolute top-[38%] text-[9px] font-mono text-emerald-300/80 bg-black/50 px-1 rounded">
                      CORE CENTER
                    </span>
                  </div>
                )}

                {/* Overlay: Delta Target Boxes */}
                {showDeltas && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-3 bottom-12 w-14 h-14 border rounded-lg border-amber-400/50 bg-amber-950/30 text-amber-300 flex flex-col items-center justify-center text-[9px] font-mono">
                      <span>DELTA L</span>
                      <span className="text-[7px] text-amber-400/80">พลิกซ้าย</span>
                    </div>
                    <div className="absolute right-3 bottom-12 w-14 h-14 border rounded-lg border-amber-400/50 bg-amber-950/30 text-amber-300 flex flex-col items-center justify-center text-[9px] font-mono">
                      <span>DELTA R</span>
                      <span className="text-[7px] text-amber-400/80">พลิกขวา</span>
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

            {/* Rolling Guide Tip */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 mb-2 text-xs text-slate-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">วิธีพลิกนิ้ว (Finger Rolling Technique):</p>
                <p className="text-[11px] text-slate-400">{currentAngleDef.guide}</p>
              </div>
            </div>

            {/* Viewfinder Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 my-1 text-xs">
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
                onClick={() => handleSaveToTarget(currentFingerKey, currentAngleId)}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98 border border-emerald-400/50"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>
                  บันทึกลง <strong>{currentFingerDef.shortName}</strong> ({currentAngleDef.label}) [กด Spacebar]
                </span>
              </button>
            </div>

          </div>


          {/* =================================================================================== */}
          {/* RIGHT SIDE: แผงควบคุม 10 นิ้ว (มือซ้าย-มือขวา) ปรับจำนวนรูปภาพได้อิสระในแต่ละนิ้ว */}
          {/* =================================================================================== */}
          <div className="lg:col-span-7 flex flex-col p-4 sm:p-5 overflow-y-auto bg-slate-950">
            
            {/* Header of Control Panel */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 shrink-0 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Hand className="w-4 h-4 text-emerald-400" />
                  <span>แผงควบคุมบันทึกลายนิ้วมือ (10 นิ้วมือ • ปรับจำนวนภาพอิสระ)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  พลิกนิ้วเก็บ Core และ Delta ซ้าย-ขวา • แต่ละนิ้วเก็บจำนวนภาพไม่เท่ากันได้ (กด + เพื่อเพิ่มรูป)
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

                <div className="space-y-2">
                  {FINGERS_ORDER.filter(f => f.hand === 'left').map(finger => {
                    const isCurrentFinger = currentFingerKey === finger.key;
                    const fingerCaptures = capturedMatrix[finger.key] || {};
                    const capturedCount = Object.keys(fingerCaptures).length;

                    // Collect standard positions plus any custom added shots
                    const customShotKeys = Object.keys(fingerCaptures).filter(k => !DEFAULT_STANDARD_POSITIONS.some(p => p.id === k));

                    return (
                      <div 
                        key={finger.key}
                        className={`p-2.5 rounded-xl border transition-all ${
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
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                              isCurrentFinger ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {finger.key}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isCurrentFinger ? 'text-blue-300' : 'text-slate-200'}`}>
                                {finger.fingerNameTh}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                บันทึกแล้ว <span className="text-emerald-400 font-bold">{capturedCount}</span> ภาพ
                              </p>
                            </div>
                          </div>

                          {/* Dynamic Shots Strip */}
                          <div className="flex flex-wrap items-center gap-1.5 flex-1 max-w-xl">
                            
                            {/* Standard Core, Delta L, Delta R, Top, Base Positions */}
                            {DEFAULT_STANDARD_POSITIONS.map(pos => {
                              const isSelectedSlot = isCurrentFinger && currentAngleId === pos.id;
                              const capturedItem = fingerCaptures[pos.id];

                              return (
                                <div key={pos.id} className="relative group">
                                  <button
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
                                    className={`relative w-14 h-13 rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all text-center cursor-pointer ${
                                      isSelectedSlot
                                        ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/50 shadow-sm'
                                        : capturedItem
                                        ? 'bg-emerald-950/40 border-emerald-700/60 hover:border-emerald-500'
                                        : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                                    }`}
                                    title={`${finger.fingerNameTh} - ${pos.label}: ${pos.guide}`}
                                  >
                                    {capturedItem ? (
                                      <div className="relative w-full h-full rounded overflow-hidden">
                                        <img 
                                          src={capturedItem.image} 
                                          alt={`${finger.key}-${pos.id}`} 
                                          className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-600 rounded-full flex items-center justify-center text-[7px] text-white font-bold">
                                          ✓
                                        </div>
                                        <span className="absolute bottom-0.5 left-0.5 text-[7px] text-white font-mono bg-black/70 px-1 rounded truncate max-w-[48px]">
                                          {pos.shortLabel}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center">
                                        <span className={`text-[11px] font-bold ${isSelectedSlot ? 'text-emerald-300' : 'text-slate-300'}`}>
                                          {pos.shortLabel}
                                        </span>
                                        <span className="text-[8px] text-slate-500">
                                          {pos.type === 'core' ? 'ศูนย์กลาง' : pos.type === 'delta_left' ? 'ซ้าย' : pos.type === 'delta_right' ? 'ขวา' : 'สัน'}
                                        </span>
                                      </div>
                                    )}
                                  </button>

                                  {/* Delete shot icon on hover */}
                                  {capturedItem && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteShot(finger.key, pos.id, e)}
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs"
                                      title="ลบรูปภาพนี้"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {/* Extra Custom Shots if any */}
                            {customShotKeys.map(k => {
                              const isSelectedSlot = isCurrentFinger && currentAngleId === k;
                              const capturedItem = fingerCaptures[k];

                              return (
                                <div key={k} className="relative group">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentFingerKey(finger.key);
                                      setCurrentAngleId(k);
                                    }}
                                    className={`relative w-14 h-13 rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all text-center cursor-pointer ${
                                      isSelectedSlot
                                        ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                                        : 'bg-emerald-950/40 border-emerald-700/60'
                                    }`}
                                    title={`${finger.fingerNameTh} - ภาพเพิ่มเติม (${k})`}
                                  >
                                    <div className="relative w-full h-full rounded overflow-hidden">
                                      <img 
                                        src={capturedItem.image} 
                                        alt={`${finger.key}-${k}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                      <span className="absolute bottom-0.5 left-0.5 text-[7px] text-amber-300 font-mono bg-black/70 px-1 rounded truncate max-w-[48px]">
                                        +ภาพ
                                      </span>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteShot(finger.key, k, e)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs"
                                    title="ลบรูปภาพนี้"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              );
                            })}

                            {/* Add Extra Shot Button (+) */}
                            <button
                              type="button"
                              onClick={() => handleAddCustomShot(finger.key)}
                              className="w-8 h-13 rounded-lg border border-dashed border-slate-700 hover:border-blue-400 hover:bg-blue-950/30 text-slate-400 hover:text-blue-300 flex flex-col items-center justify-center transition-all text-xs"
                              title="เพิ่มรูปมุมเพิ่มเติมสำหรับนิ้วนี้"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

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

                <div className="space-y-2">
                  {FINGERS_ORDER.filter(f => f.hand === 'right').map(finger => {
                    const isCurrentFinger = currentFingerKey === finger.key;
                    const fingerCaptures = capturedMatrix[finger.key] || {};
                    const capturedCount = Object.keys(fingerCaptures).length;
                    const customShotKeys = Object.keys(fingerCaptures).filter(k => !DEFAULT_STANDARD_POSITIONS.some(p => p.id === k));

                    return (
                      <div 
                        key={finger.key}
                        className={`p-2.5 rounded-xl border transition-all ${
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
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                              isCurrentFinger ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {finger.key}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold truncate ${isCurrentFinger ? 'text-emerald-300' : 'text-slate-200'}`}>
                                {finger.fingerNameTh}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                บันทึกแล้ว <span className="text-emerald-400 font-bold">{capturedCount}</span> ภาพ
                              </p>
                            </div>
                          </div>

                          {/* Dynamic Shots Strip */}
                          <div className="flex flex-wrap items-center gap-1.5 flex-1 max-w-xl">
                            
                            {/* Standard Core, Delta L, Delta R, Top, Base Positions */}
                            {DEFAULT_STANDARD_POSITIONS.map(pos => {
                              const isSelectedSlot = isCurrentFinger && currentAngleId === pos.id;
                              const capturedItem = fingerCaptures[pos.id];

                              return (
                                <div key={pos.id} className="relative group">
                                  <button
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
                                    className={`relative w-14 h-13 rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all text-center cursor-pointer ${
                                      isSelectedSlot
                                        ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/50 shadow-sm'
                                        : capturedItem
                                        ? 'bg-emerald-950/40 border-emerald-700/60 hover:border-emerald-500'
                                        : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                                    }`}
                                    title={`${finger.fingerNameTh} - ${pos.label}: ${pos.guide}`}
                                  >
                                    {capturedItem ? (
                                      <div className="relative w-full h-full rounded overflow-hidden">
                                        <img 
                                          src={capturedItem.image} 
                                          alt={`${finger.key}-${pos.id}`} 
                                          className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-600 rounded-full flex items-center justify-center text-[7px] text-white font-bold">
                                          ✓
                                        </div>
                                        <span className="absolute bottom-0.5 left-0.5 text-[7px] text-white font-mono bg-black/70 px-1 rounded truncate max-w-[48px]">
                                          {pos.shortLabel}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center">
                                        <span className={`text-[11px] font-bold ${isSelectedSlot ? 'text-emerald-300' : 'text-slate-300'}`}>
                                          {pos.shortLabel}
                                        </span>
                                        <span className="text-[8px] text-slate-500">
                                          {pos.type === 'core' ? 'ศูนย์กลาง' : pos.type === 'delta_left' ? 'ซ้าย' : pos.type === 'delta_right' ? 'ขวา' : 'สัน'}
                                        </span>
                                      </div>
                                    )}
                                  </button>

                                  {capturedItem && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteShot(finger.key, pos.id, e)}
                                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs"
                                      title="ลบรูปภาพนี้"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {/* Extra Custom Shots if any */}
                            {customShotKeys.map(k => {
                              const isSelectedSlot = isCurrentFinger && currentAngleId === k;
                              const capturedItem = fingerCaptures[k];

                              return (
                                <div key={k} className="relative group">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentFingerKey(finger.key);
                                      setCurrentAngleId(k);
                                    }}
                                    className={`relative w-14 h-13 rounded-lg border flex flex-col items-center justify-center p-0.5 transition-all text-center cursor-pointer ${
                                      isSelectedSlot
                                        ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400/50 shadow-sm'
                                        : 'bg-emerald-950/40 border-emerald-700/60'
                                    }`}
                                    title={`${finger.fingerNameTh} - ภาพเพิ่มเติม (${k})`}
                                  >
                                    <div className="relative w-full h-full rounded overflow-hidden">
                                      <img 
                                        src={capturedItem.image} 
                                        alt={`${finger.key}-${k}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                      <span className="absolute bottom-0.5 left-0.5 text-[7px] text-amber-300 font-mono bg-black/70 px-1 rounded truncate max-w-[48px]">
                                        +ภาพ
                                      </span>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteShot(finger.key, k, e)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs"
                                    title="ลบรูปภาพนี้"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              );
                            })}

                            {/* Add Extra Shot Button (+) */}
                            <button
                              type="button"
                              onClick={() => handleAddCustomShot(finger.key)}
                              className="w-8 h-13 rounded-lg border border-dashed border-slate-700 hover:border-emerald-400 hover:bg-emerald-950/30 text-slate-400 hover:text-emerald-300 flex flex-col items-center justify-center transition-all text-xs"
                              title="เพิ่มรูปมุมเพิ่มเติมสำหรับนิ้วนี้"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bottom Actions & Done Button */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between shrink-0 gap-2">
              <div className="text-xs text-slate-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>บันทึกแล้วทั้งหมด <strong className="text-white">{totalCaptured}</strong> ภาพลายนิ้วมือ</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveToFirebase}
                  disabled={firebaseSyncing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Cloud className="w-4 h-4" />
                  <span>บันทึกขึ้น Cloud</span>
                </button>

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
        <div className="bg-slate-900 px-5 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 shrink-0 gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">Futronic FS80H Optical Scanner System</span>
            <span>•</span>
            <span className="text-slate-300">500 DPI Continuous Frame Feed</span>
            <span>•</span>
            <span className="text-blue-400">{firebaseMsg}</span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>ปุ่มลัด: [Space] บันทึกมุม | [1-5] สลับตำแหน่ง Core/Delta</span>
          </div>
        </div>

      </div>
    </div>
  );
};
