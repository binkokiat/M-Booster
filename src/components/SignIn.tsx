import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface SignInProps {
  onLoginSuccess: (email: string, role: 'collector' | 'analyst' | 'admin') => void;
  onForgotPassword: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onLoginSuccess, onForgotPassword }) => {
  const [email, setEmail] = useState('collector@mindbooster.com');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('กรุณากรอก อีเมลหรือชื่อผู้ใช้*');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('กรุณากรอกรหัสผ่าน*');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Fast-login authentication simulation
    setTimeout(() => {
      setLoading(false);
      const role = email.toLowerCase().includes('analyst') ? 'analyst' : 'collector';
      onLoginSuccess(email, role);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Left side: Background with Brand Logo */}
      <div 
        className="w-full md:w-1/2 min-h-[260px] md:min-h-screen relative flex items-center justify-center p-8 bg-cover bg-center"
        style={{
          backgroundImage: `url('/assets/images/background_auth.png')`,
          backgroundColor: '#466BB2'
        }}
      >
        <div className="text-center z-10 p-6 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 shadow-2xl max-w-md">
          <img 
            src="/assets/images/logo mind booster.png" 
            alt="Mind Booster" 
            className="h-32 sm:h-44 w-auto mx-auto object-contain drop-shadow-md"
            onError={(e) => {
              // fallback if needed
              (e.currentTarget as HTMLImageElement).src = '/assets/images/logo mind booster-mini.png';
            }}
          />
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mind Booster
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100 font-medium">
            Fingerprint Dermatoglyphics & Brain Potential Analysis System
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-2 text-base text-slate-500">
              ลงชื่อเข้าใช้ด้วยบัญชีของคุณเพื่อเริ่มต้นการวิเคราะห์
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-3 text-sm text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{{ errorMsg }}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                อีเมล / ชื่อผู้ใช้
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น collector@mindbooster.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#466BB2] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs font-semibold text-[#466BB2] hover:underline"
                >
                  ลืมรหัสผ่าน ?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#466BB2] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#466BB2] hover:bg-[#3b5998] active:bg-[#324b80] text-white font-bold text-lg rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-6 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              เลือกบัญชีเข้าใช้งานด่วน (Demo Role Profiles)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail('collector@mindbooster.com');
                  setPassword('123456');
                  onLoginSuccess('collector@mindbooster.com', 'collector');
                }}
                className="p-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg text-left transition-colors"
              >
                <div className="text-xs font-bold text-[#466BB2]">Collector (เจ้าหน้าที่สแกน)</div>
                <div className="text-[11px] text-slate-500">เก็บภาพ 10 นิ้ว & ข้อมูลลูกค้า</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('analyst@mindbooster.com');
                  setPassword('123456');
                  onLoginSuccess('analyst@mindbooster.com', 'analyst');
                }}
                className="p-3 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg text-left transition-colors"
              >
                <div className="text-xs font-bold text-purple-700">Analyst (นักวิเคราะห์)</div>
                <div className="text-[11px] text-slate-500">ตรวจสอบ RC & สร้างรายงาน</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
