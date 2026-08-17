import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  Fingerprint
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  googleProvider 
} from '../firebase';
import { OfficerRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuickOfficer: (role: OfficerRole, name: string, email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSelectQuickOfficer
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<OfficerRole>('collector');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('อีเมลนี้ถูกใช้งานไปแล้ว');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      } else {
        setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Fingerprint className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {isRegister ? 'สร้างบัญชีผู้ใช้งานใหม่' : 'เข้าสู่ระบบ MBT Scanner'}
              </h2>
              <p className="text-xs text-cyan-100/80">
                ระบบจัดการและซิงค์ข้อมูลผ่าน Firebase Authentication
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Officer Demo Switch (For fast evaluation) */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                เข้าใช้งานด่วนตามบทบาท (Quick Demo)
              </span>
              <span className="text-[10px] text-slate-400">1-Click Sign-in</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectQuickOfficer('collector', 'สมชาย นักเก็บข้อมูล', 'collector@mindbooster.th');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-emerald-950/40 hover:border-emerald-500/40 border border-slate-700 text-left transition group"
              >
                <div className="text-xs font-semibold text-emerald-300 group-hover:text-emerald-200">
                  สมชาย (Collector)
                </div>
                <div className="text-[10px] text-slate-400">สแกน & บันทึกข้อมูล</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectQuickOfficer('analyst', 'ดร.วิภา นักวิเคราะห์', 'analyst@mindbooster.th');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-cyan-950/40 hover:border-cyan-500/40 border border-slate-700 text-left transition group"
              >
                <div className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                  ดร.วิภา (Analyst)
                </div>
                <div className="text-[10px] text-slate-400">นับเส้น & วิเคราะห์สมอง</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectQuickOfficer('reviewer', 'อ.กิตติ ผู้ตรวจทาน', 'reviewer@mindbooster.th');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-amber-950/40 hover:border-amber-500/40 border border-slate-700 text-left transition group"
              >
                <div className="text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                  อ.กิตติ (Reviewer)
                </div>
                <div className="text-[10px] text-slate-400">อนุมัติ & รับรองผล</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectQuickOfficer('admin', 'Admin ผู้ดูแลระบบ', 'admin@mindbooster.th');
                  onClose();
                }}
                className="px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-purple-950/40 hover:border-purple-500/40 border border-slate-700 text-left transition group"
              >
                <div className="text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                  Admin (ผู้ดูแล)
                </div>
                <div className="text-[10px] text-slate-400">จัดการทุกส่วนของระบบ</div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-500 font-medium">หรือเข้าสู่ระบบด้วย Firebase</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ชื่อ-นามสกุล / ตำแหน่ง
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@mindbooster.th"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>กำลังดำเนินการ...</span>
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>สมัครสมาชิกเจ้าหน้าที่</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ (Sign In)</span>
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.8l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
            </svg>
            <span>ดำเนินการต่อด้วย Google</span>
          </button>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
            >
              {isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครเจ้าหน้าที่ใหม่'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
