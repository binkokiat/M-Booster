import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  type: 'data' | 'report';
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  type,
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportComplete(type === 'data' ? 5 : 1);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#466BB2] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <h3 className="font-bold text-base">
              {type === 'data' ? 'นำเข้าข้อมูลลูกค้า (Import Data)' : 'นำเข้าไฟล์รายงาน (Import Report)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            รองรับไฟล์นามสกุล <strong>.xlsx, .xls, .json, .csv</strong> เพื่อนำเข้าข้อมูลเข้าสู่ระบบ
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? 'border-[#466BB2] bg-blue-50/50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-12 h-12 text-[#466BB2] mx-auto mb-2" />
            {selectedFile ? (
              <div className="space-y-1">
                <p className="font-bold text-xs text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-700">ลากและวางไฟล์ที่นี่ หรือ</p>
                <label className="mt-2 inline-block px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-[#466BB2] hover:bg-slate-50 cursor-pointer shadow-2xs">
                  เลือกไฟล์จากเครื่อง
                  <input type="file" accept=".xlsx,.xls,.json,.csv" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="px-5 py-2 bg-[#466BB2] hover:bg-[#3b5998] text-white font-bold text-xs rounded-lg shadow-xs transition-all disabled:opacity-40"
            >
              {isProcessing ? 'กำลังนำเข้าข้อมูล...' : 'เริ่มการนำเข้า'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
