import React, { useState, useRef, useEffect } from 'react';
import { ClientProfile, FingerprintItem, FingerKey, Officer, PlotPoint, LineSegment } from '../types';
import { 
  Camera, 
  Upload, 
  Save, 
  Send, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  Sliders, 
  Eye, 
  Check, 
  ChevronRight,
  User,
  ShieldCheck,
  BrainCircuit,
  Info,
  Cpu,
  Zap,
  Scan,
  Activity,
  Loader2,
  Play
} from 'lucide-react';
import { calculateComprehensiveReport } from '../utils/dermatoglyphics';
import { generateRealisticFingerprintSVG } from '../utils/sampleImages';
import { FutronicScannerModal } from './FutronicScannerModal';

interface FingerprintStudioProps {
  client: ClientProfile;
  currentUser: Officer;
  onSave: (updatedClient: ClientProfile) => void;
  onBack: () => void;
  onGenerateReport: (client: ClientProfile) => void;
}

const FINGER_DEFINITIONS: { key: FingerKey; hand: 'left' | 'right'; type: 'thumb' | 'index' | 'middle' | 'ring' | 'little'; th: string; en: string; brainLobeTh: string }[] = [
  // Left Hand
  { key: 'L1', hand: 'left', type: 'thumb', th: 'นิ้วโป้งซ้าย (L1)', en: 'Left Thumb', brainLobeTh: 'สมองส่วนหน้าด้านขวา - ความเป็นผู้นำ & จินตนาการ' },
  { key: 'L2', hand: 'left', type: 'index', th: 'นิ้วชี้ซ้าย (L2)', en: 'Left Index', brainLobeTh: 'สมองส่วนหน้า - ความคิดสร้างสรรค์ & ศิลปะ' },
  { key: 'L3', hand: 'left', type: 'middle', th: 'นิ้วกลางซ้าย (L3)', en: 'Left Middle', brainLobeTh: 'สมองส่วนขมับ - จังหวะดนตรี & มิติสัมพันธ์' },
  { key: 'L4', hand: 'left', type: 'ring', th: 'นิ้วนางซ้าย (L4)', en: 'Left Ring', brainLobeTh: 'สมองส่วนการได้ยิน - สุนทรียศาสตร์เสียง & อารมณ์' },
  { key: 'L5', hand: 'left', type: 'little', th: 'นิ้วก้อยซ้าย (L5)', en: 'Left Little', brainLobeTh: 'สมองส่วนท้ายทอย - การสังเกต & ความจำรูปภาพ' },
  // Right Hand
  { key: 'R1', hand: 'right', type: 'thumb', th: 'นิ้วโป้งขวา (R1)', en: 'Right Thumb', brainLobeTh: 'สมองส่วนหน้าด้านซ้าย - การวางแผน & การจัดการ' },
  { key: 'R2', hand: 'right', type: 'index', th: 'นิ้วชี้ขวา (R2)', en: 'Right Index', brainLobeTh: 'สมองส่วนหน้า - ตรรกะ & การวิเคราะห์คำนวณ' },
  { key: 'R3', hand: 'right', type: 'middle', th: 'นิ้วกลางขวา (R3)', en: 'Right Middle', brainLobeTh: 'สมองส่วนสั่งการ - กล้ามเนื้อมัดเล็ก & การควบคุมร่างกาย' },
  { key: 'R4', hand: 'right', type: 'ring', th: 'นิ้วนางขวา (R4)', en: 'Right Ring', brainLobeTh: 'สมองส่วนภาษา - การสื่อสาร & ตีความความหมาย' },
  { key: 'R5', hand: 'right', type: 'little', th: 'นิ้วก้อยขวา (R5)', en: 'Right Little', brainLobeTh: 'สมองส่วนการมองเห็น - การอ่าน & ภาพรวมโครงสร้าง' },
];

const PATTERN_TYPES = [
  { code: 'Wt', name: 'Wt - Target Whorl (เป้าตาวัว)', category: 'Whorl' },
  { code: 'Ws', name: 'Ws - Spiral Whorl (ก้นหอยวน)', category: 'Whorl' },
  { code: 'We', name: 'We - Elongated Whorl', category: 'Whorl' },
  { code: 'Wi', name: 'Wi - Imploding Whorl', category: 'Whorl' },
  { code: 'Wc', name: 'Wc - Composite Whorl', category: 'Whorl' },
  { code: 'Wd', name: 'Wd - Double Loop (มัดหวายคู่/หยินหยาง)', category: 'Whorl' },
  { code: 'Wp', name: 'Wp - Peacock Eye (ตานกยูง)', category: 'Whorl' },
  { code: 'Wl', name: 'Wl - Lateral Pocket Whorl', category: 'Whorl' },
  { code: 'Wx', name: 'Wx - Accidental Whorl', category: 'Whorl' },
  { code: 'U', name: 'U / UL - Ulnar Loop (มัดหวายปัดก้อย)', category: 'Loop' },
  { code: 'R', name: 'R / RL - Radial Loop (มัดหวายปัดโป้ง)', category: 'Loop' },
  { code: 'Lf', name: 'Lf - Falling Loop', category: 'Loop' },
  { code: 'As', name: 'As - Simple Arch (โค้งเรียบ)', category: 'Arch' },
  { code: 'At', name: 'At - Tented Arch (กระโจม)', category: 'Arch' },
  { code: 'Au', name: 'Au - Ulnar Arch', category: 'Arch' },
  { code: 'Ar', name: 'Ar - Radial Arch', category: 'Arch' },
];

export const FingerprintStudio: React.FC<FingerprintStudioProps> = ({
  client,
  currentUser,
  onSave,
  onBack,
  onGenerateReport
}) => {
  const [activeHand, setActiveHand] = useState<'left' | 'right'>('left');
  const [selectedFingerKey, setSelectedFingerKey] = useState<FingerKey>('L1');
  const [activeAngle, setActiveAngle] = useState<string>('angle_1');
  
  // Client Info State
  const [clientForm, setClientForm] = useState<ClientProfile>({ ...client });
  
  // Fingerprints map
  const [fingerprints, setFingerprints] = useState<Record<FingerKey, FingerprintItem>>(() => {
    if (client.fingerprints && Object.keys(client.fingerprints).length > 0) {
      return client.fingerprints;
    }
    const init: any = {};
    FINGER_DEFINITIONS.forEach(f => {
      init[f.key] = {
        key: f.key,
        finger_name_th: f.th,
        finger_name_en: f.en,
        hand: f.hand,
        finger_type: f.type,
        ai_type: f.key.startsWith('L1') || f.key.startsWith('R1') ? 'Wt' : 'U',
        ai_RC1: 14,
        ai_RC2: 12,
        analyst_type: f.key.startsWith('L1') || f.key.startsWith('R1') ? 'Wt' : 'U',
        analyst_RC1: 14,
        analyst_RC2: 12,
        angles: {
          angle_1: {
            image: generateRealisticFingerprintSVG(f.key, f.type === 'thumb' ? 'WC' : 'UL', 14),
            lines: [{ start: { x: 45, y: 155 }, end: { x: 120, y: 110 }, type: 'delta-core' }],
            plot_coordinates: [
              { x: 55, y: 148, order: 1 },
              { x: 70, y: 138, order: 2 },
              { x: 85, y: 128, order: 3 },
              { x: 100, y: 120, order: 4 },
              { x: 115, y: 112, order: 5 }
            ],
            ai_RC: 14,
            analyst_RC: 14,
            contrast: 100,
            brightness: 100,
            invert: false
          }
        },
        isComplete: true
      };
    });
    return init;
  });

  // Scanning Visual Feedback / Temporary Preview State
  const [isScanningFeedback, setIsScanningFeedback] = useState<boolean>(false);
  const [scanFeedbackStage, setScanFeedbackStage] = useState<'detecting' | 'capturing' | 'enhancing' | 'completed' | 'idle'>('idle');
  const [temporaryPreviewImage, setTemporaryPreviewImage] = useState<string | null>(null);
  const [scanFeedbackMessage, setScanFeedbackMessage] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Canvas / Editor tools state
  const [activeTool, setActiveTool] = useState<'pan' | 'plot' | 'line'>('plot');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [tempLineStart, setTempLineStart] = useState<{ x: number; y: number } | null>(null);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'profile' | 'fingerprint'>('fingerprint');
  const [isFutronicModalOpen, setIsFutronicModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentFinger = fingerprints[selectedFingerKey] || fingerprints['L1'];
  const currentAngleData = currentFinger?.angles?.[activeAngle] || {
    image: '',
    lines: [],
    plot_coordinates: [],
    ai_RC: 0,
    analyst_RC: 0
  };

  // Switch hand tab updates selection
  const handleSelectHand = (hand: 'left' | 'right') => {
    setActiveHand(hand);
    setSelectedFingerKey(hand === 'left' ? 'L1' : 'R1');
  };

  // Trigger quick scan simulation with realistic live optical feedback on studio canvas
  const triggerSimulatedStudioScan = (targetKey?: FingerKey, targetAngle?: string) => {
    const fingerKey = targetKey || selectedFingerKey;
    const angleKey = targetAngle || activeAngle;
    const currentDef = FINGER_DEFINITIONS.find(f => f.key === fingerKey);
    const pattern = fingerprints[fingerKey]?.analyst_type || fingerprints[fingerKey]?.ai_type || (fingerKey.includes('1') ? 'WC' : 'UL');

    setIsScanningFeedback(true);
    setScanFeedbackStage('detecting');
    setScanProgress(15);
    setScanFeedbackMessage(`Futronic FS80H: ตรวจจับระนาบนิ้วมือ ${currentDef?.th || fingerKey}...`);
    
    // Generate realistic optical placeholder frame
    const simulatedScan = generateRealisticFingerprintSVG(fingerKey, pattern, 14);
    setTemporaryPreviewImage(simulatedScan);

    // Stage 1: Capturing frame at 500 DPI
    const timer1 = setTimeout(() => {
      setScanFeedbackStage('capturing');
      setScanProgress(55);
      setScanFeedbackMessage('กำลังสแกนลายนิ้วมือ 500 DPI (Optical Live Sensor)...');
    }, 400);

    // Stage 2: Enhancing ridges and contrast
    const timer2 = setTimeout(() => {
      setScanFeedbackStage('enhancing');
      setScanProgress(85);
      setScanFeedbackMessage('ปรับสมดุลแสงและความคมชัด (Auto Ridge Enhancement)...');
    }, 950);

    // Stage 3: Completed & Apply image
    const timer3 = setTimeout(() => {
      setScanFeedbackStage('completed');
      setScanProgress(100);
      setScanFeedbackMessage('จับภาพสำเร็จ! บันทึกลายนิ้วมือ 500 DPI เรียบร้อย');
      handleApplyFutronicScan(simulatedScan, angleKey, fingerKey);
    }, 1450);

    // Reset overlay after short visual confirmation
    const timer4 = setTimeout(() => {
      setIsScanningFeedback(false);
      setScanFeedbackStage('idle');
      setTemporaryPreviewImage(null);
      setScanProgress(0);
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  // Bulk update fingerprints from Scanner Station
  const handleBulkUpdateFingerprints = (matrix: Record<string, Record<string, { image: string; type: any; label: string }>>) => {
    setFingerprints(prev => {
      const next: Record<FingerKey, FingerprintItem> = { ...prev };
      Object.keys(matrix).forEach(fKey => {
        const fingerKey = fKey as FingerKey;
        const shots = matrix[fKey];
        if (shots && Object.keys(shots).length > 0) {
          const existing = next[fingerKey] || {
            key: fingerKey,
            finger_name_th: FINGER_DEFINITIONS.find(f => f.key === fingerKey)?.th || fingerKey,
            finger_name_en: FINGER_DEFINITIONS.find(f => f.key === fingerKey)?.en || fingerKey,
            hand: fingerKey.startsWith('L') ? 'left' : 'right',
            finger_type: 'thumb',
            ai_type: 'Wt',
            ai_RC1: 14,
            ai_RC2: 12,
            analyst_type: 'Wt',
            analyst_RC1: 14,
            analyst_RC2: 12,
            angles: {}
          };
          const newAngles = { ...existing.angles };
          Object.keys(shots).forEach(shotId => {
            newAngles[shotId] = {
              ...(newAngles[shotId] || { lines: [], plot_coordinates: [] }),
              image: shots[shotId].image,
              position_type: shots[shotId].type,
              position_label_th: shots[shotId].label,
              capturedAt: new Date().toISOString()
            };
          });
          next[fingerKey] = {
            ...existing,
            angles: newAngles,
            isComplete: true
          };
        }
      });

      const updatedClient: ClientProfile = {
        ...clientForm,
        fingerprints: next,
        has_scans: true,
        latest_modified: new Date().toISOString()
      };
      setClientForm(updatedClient);
      onSave(updatedClient);
      return next;
    });
  };

  // Apply Futronic Scan Image
  const handleApplyFutronicScan = (dataUrl: string, targetAngle?: string, targetFingerKey?: FingerKey) => {
    const fingerToUse = targetFingerKey || selectedFingerKey;
    const angleToUse = targetAngle || activeAngle;
    
    setSelectedFingerKey(fingerToUse);
    setActiveAngle(angleToUse);

    // Provide visual feedback confirmation on studio canvas
    setTemporaryPreviewImage(dataUrl);
    setIsScanningFeedback(true);
    setScanFeedbackStage('completed');
    setScanProgress(100);
    setScanFeedbackMessage('รับภาพจากหัวอ่าน Futronic FS80H สำเร็จ (500 DPI)');

    setTimeout(() => {
      setIsScanningFeedback(false);
      setScanFeedbackStage('idle');
      setTemporaryPreviewImage(null);
      setScanProgress(0);
    }, 1100);
    
    setFingerprints(prev => {
      const existingFinger = prev[fingerToUse] || {
        key: fingerToUse,
        finger_name_th: FINGER_DEFINITIONS.find(f => f.key === fingerToUse)?.th || fingerToUse,
        finger_name_en: FINGER_DEFINITIONS.find(f => f.key === fingerToUse)?.en || fingerToUse,
        hand: fingerToUse.startsWith('L') ? 'left' : 'right',
        finger_type: 'thumb',
        ai_type: 'Wt',
        ai_RC1: 14,
        ai_RC2: 12,
        analyst_type: 'Wt',
        analyst_RC1: 14,
        analyst_RC2: 12,
        angles: {}
      };
      const updatedFingerprints: Record<FingerKey, FingerprintItem> = {
        ...prev,
        [fingerToUse]: {
          ...existingFinger,
          angles: {
            ...existingFinger.angles,
            [angleToUse]: {
              ...(existingFinger.angles?.[angleToUse] || { lines: [], plot_coordinates: [] }),
              image: dataUrl,
              capturedAt: new Date().toISOString()
            }
          }
        }
      };

      const updatedClient: ClientProfile = {
        ...clientForm,
        fingerprints: updatedFingerprints,
        has_scans: true,
        latest_modified: new Date().toISOString()
      };
      setClientForm(updatedClient);
      onSave(updatedClient);

      return updatedFingerprints;
    });
  };

  // Move to next angle (1 -> 2 -> ... -> 7)
  const handleNextAngle = () => {
    const currentNum = parseInt(activeAngle.replace('angle_', ''), 10) || 1;
    if (currentNum < 7) {
      setActiveAngle(`angle_${currentNum + 1}`);
    } else {
      // Find next finger
      const allKeys: FingerKey[] = activeHand === 'left' 
        ? ['L1', 'L2', 'L3', 'L4', 'L5']
        : ['R1', 'R2', 'R3', 'R4', 'R5'];
      const currentIndex = allKeys.indexOf(selectedFingerKey);
      if (currentIndex < allKeys.length - 1) {
        setSelectedFingerKey(allKeys[currentIndex + 1]);
        setActiveAngle('angle_1');
      }
    }
  };

  // Camera capture handlers
  const startCamera = async (mode: 'profile' | 'fingerprint') => {
    setCameraMode(mode);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งานกล้องในเบราว์เซอร์');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      if (cameraMode === 'profile') {
        setClientForm(prev => ({ ...prev, profile_image: dataUrl }));
      } else {
        updateCurrentAngleImage(dataUrl);
      }
    }
    stopCamera();
  };

  const updateCurrentAngleImage = (dataUrl: string) => {
    setFingerprints(prev => ({
      ...prev,
      [selectedFingerKey]: {
        ...prev[selectedFingerKey],
        angles: {
          ...prev[selectedFingerKey].angles,
          [activeAngle]: {
            ...(prev[selectedFingerKey].angles?.[activeAngle] || { lines: [], plot_coordinates: [] }),
            image: dataUrl,
            capturedAt: new Date().toISOString()
          }
        }
      }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: 'profile' | 'fingerprint') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (mode === 'profile') {
          setClientForm(prev => ({ ...prev, profile_image: dataUrl }));
        } else {
          updateCurrentAngleImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Click for Point Plotting & Line Drawing
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !currentAngleData.image) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 240);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 240);

    if (activeTool === 'plot') {
      const newPoint: PlotPoint = {
        x,
        y,
        order: (currentAngleData.plot_coordinates?.length || 0) + 1
      };
      const updatedPlots = [...(currentAngleData.plot_coordinates || []), newPoint];
      
      setFingerprints(prev => ({
        ...prev,
        [selectedFingerKey]: {
          ...prev[selectedFingerKey],
          analyst_RC1: updatedPlots.length,
          angles: {
            ...prev[selectedFingerKey].angles,
            [activeAngle]: {
              ...currentAngleData,
              plot_coordinates: updatedPlots,
              analyst_RC: updatedPlots.length
            }
          }
        }
      }));
    } else if (activeTool === 'line') {
      if (!tempLineStart) {
        setTempLineStart({ x, y });
        setIsDrawingLine(true);
      } else {
        const newLine: LineSegment = {
          start: tempLineStart,
          end: { x, y },
          type: 'delta-core'
        };
        const updatedLines = [...(currentAngleData.lines || []), newLine];
        setTempLineStart(null);
        setIsDrawingLine(false);

        setFingerprints(prev => ({
          ...prev,
          [selectedFingerKey]: {
            ...prev[selectedFingerKey],
            angles: {
              ...prev[selectedFingerKey].angles,
              [activeAngle]: {
                ...currentAngleData,
                lines: updatedLines
              }
            }
          }
        }));
      }
    }
  };

  const handleClearPlots = () => {
    setFingerprints(prev => ({
      ...prev,
      [selectedFingerKey]: {
        ...prev[selectedFingerKey],
        angles: {
          ...prev[selectedFingerKey].angles,
          [activeAngle]: {
            ...currentAngleData,
            plot_coordinates: [],
            lines: []
          }
        }
      }
    }));
  };

  const handleSaveAll = () => {
    const updatedClient: ClientProfile = {
      ...clientForm,
      fingerprints,
      has_scans: true,
      latest_modified: new Date().toISOString()
    };
    onSave(updatedClient);
    alert('บันทึกข้อมูลและรูปลายนิ้วมือทั้งหมดขึ้น Firebase สำเร็จเรียบร้อย!');
  };

  const handleUpdateStatus = (newStatus: ClientProfile['status']) => {
    const updatedClient: ClientProfile = {
      ...clientForm,
      status: newStatus,
      fingerprints,
      has_scans: true,
      latest_modified: new Date().toISOString()
    };
    setClientForm(updatedClient);
    onSave(updatedClient);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-[#466BB2] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <span>{clientForm.user_id_code || 'New Client'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-[#466BB2] border border-blue-200 uppercase">
                {clientForm.status}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {clientForm.first_name} {clientForm.last_name} ({clientForm.nick_name || '-'})
            </p>
          </div>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveAll}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#466BB2] hover:bg-[#3b5998] text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกข้อมูล</span>
          </button>

          {currentUser.role === 'collector' && clientForm.status === 'created' && (
            <button
              onClick={() => handleUpdateStatus('ready_to_review')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-all"
            >
              <Send className="w-4 h-4" />
              <span>ส่งตรวจสอบ (Ready to Review)</span>
            </button>
          )}

          {currentUser.role === 'analyst' && (
            <>
              {clientForm.status === 'ready_to_review' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('approved')}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>อนุมัติภาพ</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('disapproved')}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ไม่อนุมัติ</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  handleUpdateStatus('reported');
                  onGenerateReport(clientForm);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#74B9FF] hover:bg-[#5da2e8] text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-all"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>ประมวลผลรายงาน (Generate Report)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section 1: Client Personal Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2 text-[#466BB2]">
          <User className="w-4 h-4" />
          <span>ข้อมูลส่วนตัวผู้รับการประเมิน (Client Information)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Avatar & Photo Upload */}
          <div className="md:col-span-3 lg:col-span-2 flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shadow-2xs group">
              {clientForm.profile_image ? (
                <img src={clientForm.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => startCamera('profile')}
                  className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 shadow-xs"
                  title="ถ่ายรูปจากกล้อง"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <label className="p-2 bg-white text-slate-800 rounded-full hover:bg-slate-100 shadow-xs cursor-pointer" title="อัปโหลดรูป">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'profile')} />
                </label>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-[11px] text-slate-400">รูปถ่ายผู้รับการสแกน</span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-9 lg:col-span-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">รหัสลูกค้า (Client ID)</label>
              <input
                type="text"
                value={clientForm.user_id_code}
                onChange={(e) => setClientForm({ ...clientForm, user_id_code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อเล่น (Nickname) *</label>
              <input
                type="text"
                value={clientForm.nick_name}
                onChange={(e) => setClientForm({ ...clientForm, nick_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อจริง (First Name)</label>
              <input
                type="text"
                value={clientForm.first_name}
                onChange={(e) => setClientForm({ ...clientForm, first_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">นามสกุล (Last Name)</label>
              <input
                type="text"
                value={clientForm.last_name}
                onChange={(e) => setClientForm({ ...clientForm, last_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรศัพท์ (Phone)</label>
              <input
                type="tel"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เพศ (Gender)</label>
              <select
                value={clientForm.gender}
                onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              >
                <option value="male">ชาย (Male)</option>
                <option value="female">หญิง (Female)</option>
                <option value="other">อื่นๆ (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">วันเกิด (Birth Date)</label>
              <input
                type="date"
                value={clientForm.birth_date ? clientForm.birth_date.slice(0, 10) : ''}
                onChange={(e) => setClientForm({ ...clientForm, birth_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เลขบัตรประชาชน (Citizen ID)</label>
              <input
                type="text"
                value={clientForm.citizen_id}
                onChange={(e) => setClientForm({ ...clientForm, citizen_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อผู้ปกครอง (Parent Name)</label>
              <input
                type="text"
                value={clientForm.parent_name}
                onChange={(e) => setClientForm({ ...clientForm, parent_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์ผู้ปกครอง (Parent Phone)</label>
              <input
                type="tel"
                value={clientForm.parent_phone}
                onChange={(e) => setClientForm({ ...clientForm, parent_phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Line ID</label>
              <input
                type="text"
                value={clientForm.line_id}
                onChange={(e) => setClientForm({ ...clientForm, line_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมล (Email สำหรับส่งรายงาน)</label>
              <input
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-[#466BB2]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: 10 Fingerprints Capture & Dermatoglyphics Studio */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center justify-between text-[#466BB2]">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4" />
            <span>สตูดิโอบันทึกและวิเคราะห์ลายนิ้วมือ 10 นิ้ว (10 Fingerprints Studio)</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            กำลังวิเคราะห์: <strong className="text-[#466BB2]">{currentFinger.finger_name_th}</strong>
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Hands Navigator */}
          <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-center">
            
            {/* Hand Switch Tabs */}
            <div className="w-full grid grid-cols-2 gap-2 mb-4 bg-slate-200/70 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleSelectHand('left')}
                className={`py-2 text-sm font-bold rounded-md transition-all ${
                  activeHand === 'left' ? 'bg-[#466BB2] text-white shadow-xs' : 'text-slate-700 hover:bg-white/50'
                }`}
              >
                มือซ้าย (Left Hand)
              </button>
              <button
                type="button"
                onClick={() => handleSelectHand('right')}
                className={`py-2 text-sm font-bold rounded-md transition-all ${
                  activeHand === 'right' ? 'bg-[#466BB2] text-white shadow-xs' : 'text-slate-700 hover:bg-white/50'
                }`}
              >
                มือขวา (Right Hand)
              </button>
            </div>

            {/* Hand Graphic with Interactive Hotspots */}
            <div className="hand-container my-2">
              <img 
                src={activeHand === 'left' ? '/assets/images/left_hand.png' : '/assets/images/right_hand.png'} 
                alt="Hand Diagram" 
                className="w-48 mx-auto drop-shadow-sm select-none"
              />

              {activeHand === 'left' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('L5')}
                    className={`finger-btn lh-pinkie ${selectedFingerKey === 'L5' ? 'active' : ''}`}
                    title="L5 - ก้อยซ้าย"
                  >
                    L5
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('L4')}
                    className={`finger-btn lh-ring ${selectedFingerKey === 'L4' ? 'active' : ''}`}
                    title="L4 - นางซ้าย"
                  >
                    L4
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('L3')}
                    className={`finger-btn lh-middle ${selectedFingerKey === 'L3' ? 'active' : ''}`}
                    title="L3 - กลางซ้าย"
                  >
                    L3
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('L2')}
                    className={`finger-btn lh-index ${selectedFingerKey === 'L2' ? 'active' : ''}`}
                    title="L2 - ชี้ซ้าย"
                  >
                    L2
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('L1')}
                    className={`finger-btn lh-thumb ${selectedFingerKey === 'L1' ? 'active' : ''}`}
                    title="L1 - โป้งซ้าย"
                  >
                    L1
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('R1')}
                    className={`finger-btn rh-thumb ${selectedFingerKey === 'R1' ? 'active' : ''}`}
                    title="R1 - โป้งขวา"
                  >
                    R1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('R2')}
                    className={`finger-btn rh-index ${selectedFingerKey === 'R2' ? 'active' : ''}`}
                    title="R2 - ชี้ขวา"
                  >
                    R2
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('R3')}
                    className={`finger-btn rh-middle ${selectedFingerKey === 'R3' ? 'active' : ''}`}
                    title="R3 - กลางขวา"
                  >
                    R3
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('R4')}
                    className={`finger-btn rh-ring ${selectedFingerKey === 'R4' ? 'active' : ''}`}
                    title="R4 - นางขวา"
                  >
                    R4
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFingerKey('R5')}
                    className={`finger-btn rh-pinkie ${selectedFingerKey === 'R5' ? 'active' : ''}`}
                    title="R5 - ก้อยขวา"
                  >
                    R5
                  </button>
                </>
              )}
            </div>

            {/* Brain Function Info Box */}
            <div className="w-full mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <div className="font-bold text-[#466BB2] mb-1 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>ตำแหน่งสมองที่สอดคล้อง:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {FINGER_DEFINITIONS.find(f => f.key === selectedFingerKey)?.brainLobeTh}
              </p>
            </div>

          </div>

          {/* Center & Right: Finger Canvas, Angles, Plotting & Classification */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Dynamic Rolling Shots Tabs & Scanner Trigger */}
            <div className="flex flex-wrap items-center justify-between bg-slate-100 p-2 rounded-xl border border-slate-200 gap-2">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 flex-1">
                {Object.keys(currentFinger.angles || {}).length > 0 ? (
                  Object.keys(currentFinger.angles).map((angKey, idx) => {
                    const angData = currentFinger.angles[angKey];
                    const hasImg = !!angData?.image;
                    const label = angKey === 'core' || angKey === 'angle_1' ? '1. Core' :
                                  angKey === 'delta_left' || angKey === 'angle_2' ? '2. Delta L' :
                                  angKey === 'delta_right' || angKey === 'angle_3' ? '3. Delta R' :
                                  angKey === 'edge_top' || angKey === 'angle_4' ? '4. สันบน' :
                                  angKey === 'edge_bottom' || angKey === 'angle_5' ? '5. สันล่าง' :
                                  `+ภาพ (${idx + 1})`;

                    return (
                      <button
                        key={angKey}
                        onClick={() => setActiveAngle(angKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer ${
                          activeAngle === angKey
                            ? 'bg-[#466BB2] text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <span>{label}</span>
                        {hasImg && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                      </button>
                    );
                  })
                ) : (
                  ['core', 'delta_left', 'delta_right'].map((posKey) => (
                    <button
                      key={posKey}
                      onClick={() => setActiveAngle(posKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all ${
                        activeAngle === posKey
                          ? 'bg-[#466BB2] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <span>{posKey === 'core' ? '1. Core' : posKey === 'delta_left' ? '2. Delta L' : '3. Delta R'}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => triggerSimulatedStudioScan()}
                  disabled={isScanningFeedback}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shrink-0 shadow-xs transition-all cursor-pointer"
                  title="จำลองการจับภาพจากเครื่องสแกน Futronic FS80H บน Canvas ทันที"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>{isScanningFeedback ? 'กำลังสแกน...' : 'จำลองสแกนด่วน (Simulate Scan)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFutronicModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shrink-0 shadow-xs transition-all cursor-pointer"
                  title="เปิดสตูดิโอสแกนเนอร์ Futronic FS80H"
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-300" />
                  <span>สถานีสแกนเนอร์ FS80H</span>
                </button>
              </div>
            </div>

            {/* Canvas / Image Editor Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Canvas Area */}
              <div className="md:col-span-7 flex flex-col items-center bg-slate-900 p-4 rounded-xl shadow-inner relative select-none">
                
                {/* Toolbar overlays */}
                <div className="w-full flex items-center justify-between mb-3 text-xs text-white">
                  <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setActiveTool('plot')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        activeTool === 'plot' ? 'bg-[#74B9FF] text-white' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      นับเส้นสัน (Plot RC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTool('line')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        activeTool === 'line' ? 'bg-[#74B9FF] text-white' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      วาดเส้น Delta-Core
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.25))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(z => Math.max(1, z - 0.25))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearPlots}
                      className="p-1.5 bg-rose-900/50 hover:bg-rose-800 text-rose-300 rounded"
                      title="ล้างจุดที่นับทั้งหมด"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Fingerprint Interactive Canvas Container */}
                <div 
                  ref={containerRef}
                  onClick={handleCanvasClick}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center'
                  }}
                  className="w-60 h-60 bg-black rounded-lg relative overflow-hidden border border-slate-700 flex items-center justify-center cursor-crosshair transition-transform shadow-2xl"
                >
                  {/* Active Scan Visual Feedback / Live Optical Placeholder */}
                  {isScanningFeedback || temporaryPreviewImage ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
                      {temporaryPreviewImage ? (
                        <img
                          src={temporaryPreviewImage}
                          alt="Scanning Preview"
                          className={`w-full h-full object-contain transition-all duration-300 ${
                            scanFeedbackStage === 'detecting' ? 'opacity-40 blur-[1px] brightness-75' :
                            scanFeedbackStage === 'capturing' ? 'opacity-90 contrast-125 brightness-110' :
                            scanFeedbackStage === 'enhancing' ? 'opacity-100 contrast-150 brightness-105' :
                            'opacity-100 contrast-125'
                          }`}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-2" />
                          <span className="text-[11px] text-cyan-300 font-mono">INITIALIZING SENSOR...</span>
                        </div>
                      )}

                      {/* Optical Sensor Grid Matrix Overlay */}
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-25"
                        style={{
                          backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)',
                          backgroundSize: '16px 16px'
                        }}
                      />

                      {/* Animated Laser Scanning Sweep Line */}
                      {scanFeedbackStage !== 'completed' && (
                        <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan-sweep pointer-events-none z-20" />
                      )}

                      {/* Scanner Corner Crosshair Reticles */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                      {/* Center Target Marker */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        <div className="w-10 h-10 border border-dashed border-cyan-400 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                        </div>
                      </div>

                      {/* Header Badge */}
                      <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none z-20">
                        <div className="px-2 py-0.5 bg-slate-900/90 border border-cyan-500/40 rounded text-[10px] text-cyan-300 font-mono font-bold flex items-center space-x-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span>FS80H 500 DPI</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-500/40">
                          {scanProgress}%
                        </span>
                      </div>

                      {/* Bottom Live Status Banner */}
                      <div className="absolute bottom-2.5 inset-x-2 bg-slate-900/95 border border-cyan-500/50 rounded-lg p-2 text-center pointer-events-none z-20 backdrop-blur-xs shadow-lg">
                        <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-cyan-200 mb-1">
                          {scanFeedbackStage === 'completed' ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          )}
                          <span className="truncate">{scanFeedbackMessage}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : currentAngleData.image ? (
                    <img
                      src={currentAngleData.image}
                      alt="Fingerprint Scan"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <span className="text-xs text-slate-500">ยังไม่มีภาพในมุมนี้</span>
                      <p className="text-[10px] text-slate-500 mt-1">คลิก "จำลองสแกนด่วน" หรือ "สแกนด้วย FS80H"</p>
                    </div>
                  )}

                  {/* Render Lines */}
                  {!isScanningFeedback && currentAngleData.lines?.map((line, idx) => (
                    <svg key={idx} className="absolute inset-0 w-full h-full pointer-events-none">
                      <line
                        x1={(line.start.x / 240) * 100 + '%'}
                        y1={(line.start.y / 240) * 100 + '%'}
                        x2={(line.end.x / 240) * 100 + '%'}
                        y2={(line.end.y / 240) * 100 + '%'}
                        stroke="#FFC312"
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />
                      <circle cx={(line.start.x / 240) * 100 + '%'} cy={(line.start.y / 240) * 100 + '%'} r="4" fill="#E66E32" />
                      <circle cx={(line.end.x / 240) * 100 + '%'} cy={(line.end.y / 240) * 100 + '%'} r="4" fill="#01CBC6" />
                    </svg>
                  ))}

                  {/* Render Plot RC Points */}
                  {!isScanningFeedback && currentAngleData.plot_coordinates?.map((pt, idx) => (
                    <div
                      key={idx}
                      style={{
                        left: `${(pt.x / 240) * 100}%`,
                        top: `${(pt.y / 240) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className="absolute w-3.5 h-3.5 bg-rose-500 text-white rounded-full border border-white flex items-center justify-center text-[9px] font-bold shadow-xs pointer-events-none"
                    >
                      {pt.order}
                    </div>
                  ))}
                </div>

                {/* Capture & Upload controls */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerSimulatedStudioScan()}
                    disabled={isScanningFeedback}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{isScanningFeedback ? 'กำลังสแกน...' : 'จำลองสแกนด่วน (Simulate Scan)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFutronicModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Cpu className="w-4 h-4 text-amber-300" />
                    <span>สแกนด้วย Futronic FS80H</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startCamera('fingerprint')}
                    className="px-3 py-1.5 bg-[#466BB2] hover:bg-[#3b5998] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>ถ่ายภาพจากกล้อง</span>
                  </button>

                  <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดภาพ</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'fingerprint')} />
                  </label>
                </div>

              </div>

              {/* Classification & Ridge Count Panel */}
              <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    การจำแนกประเภทลาย (Classification)
                  </h3>

                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    ประเภทลายนิ้วมือ (Pattern Type)
                  </label>
                  <select
                    value={currentFinger.analyst_type || currentFinger.ai_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFingerprints(prev => ({
                        ...prev,
                        [selectedFingerKey]: {
                          ...prev[selectedFingerKey],
                          analyst_type: newType,
                          ai_type: newType
                        }
                      }));
                    }}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-1 focus:ring-[#466BB2]"
                  >
                    {PATTERN_TYPES.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ridge Count Inputs */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">จำนวนเส้นสัน RC 1 (Ridge Count 1):</span>
                    <input
                      type="number"
                      value={currentFinger.analyst_RC1}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFingerprints(prev => ({
                          ...prev,
                          [selectedFingerKey]: {
                            ...prev[selectedFingerKey],
                            analyst_RC1: val,
                            ai_RC1: val
                          }
                        }));
                      }}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold text-[#466BB2]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">จำนวนเส้นสัน RC 2 (Ridge Count 2):</span>
                    <input
                      type="number"
                      value={currentFinger.analyst_RC2}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFingerprints(prev => ({
                          ...prev,
                          [selectedFingerKey]: {
                            ...prev[selectedFingerKey],
                            analyst_RC2: val,
                            ai_RC2: val
                          }
                        }));
                      }}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold text-[#466BB2]"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    <div className="font-bold mb-1">ผลสรุปค่านิ้วนี้:</div>
                    <div>Max RC = <strong>{Math.max(currentFinger.analyst_RC1 || 0, currentFinger.analyst_RC2 || 0)}</strong></div>
                    <div>Pattern: <strong className="uppercase">{currentFinger.analyst_type}</strong></div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-[#466BB2] text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">
                {cameraMode === 'profile' ? 'ถ่ายรูปผู้รับการสแกน' : `ถ่ายรูปลายนิ้วมือ (${selectedFingerKey} - ${activeAngle})`}
              </span>
              <button onClick={stopCamera} className="text-white hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center bg-slate-900">
              <div className="w-full max-w-sm aspect-4/3 bg-black rounded-lg overflow-hidden relative">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {cameraMode === 'profile' && (
                  <img 
                    src="/assets/images/crop-image.png" 
                    alt="Guide" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-60"
                  />
                )}
              </div>

              <div className="mt-5 flex items-center space-x-3">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2.5 bg-[#466BB2] hover:bg-[#3b5998] text-white font-bold text-sm rounded-full shadow-lg flex items-center space-x-2 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>บันทึกภาพถ่าย (Capture)</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-full transition-all"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Futronic FS80H Hardware Scanner Modal */}
      <FutronicScannerModal
        isOpen={isFutronicModalOpen}
        onClose={() => setIsFutronicModalOpen(false)}
        selectedFingerKey={selectedFingerKey}
        fingerNameTh={currentFinger.finger_name_th}
        activeAngle={activeAngle}
        patternType={currentFinger.analyst_type || currentFinger.ai_type || 'Wt'}
        clientId={client.id}
        onApplyScan={handleApplyFutronicScan}
        onNextAngle={handleNextAngle}
        existingFingerprints={fingerprints}
        onBulkUpdateFingerprints={handleBulkUpdateFingerprints}
      />

    </div>
  );
};
