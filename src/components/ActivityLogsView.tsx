import React from 'react';
import { 
  Activity, 
  Clock, 
  User, 
  Fingerprint, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({
  logs,
  onRefresh
}) => {
  const getActionBadge = (type: ActivityLog['action_type']) => {
    switch (type) {
      case 'create':
        return { label: 'สร้างผู้รับการตรวจ', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'scan':
        return { label: 'สแกน/นับเส้น', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'ai_analyze':
        return { label: 'AI วิเคราะห์', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'review':
        return { label: 'ตรวจทานข้อมูล', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'approve':
        return { label: 'อนุมัติผล', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      case 'export':
        return { label: 'ออกรายงาน/Export', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { label: type, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              ประวัติการดำเนินงานแบบ Real-time (Operation Logs)
            </h2>
            <p className="text-xs text-slate-400">
              บันทึกทุกขั้นตอนการสแกน การนับเส้น และการออกรายงานที่ซิงค์กับ Firestore
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            ยังไม่มีบันทึกกิจกรรมในระบบ
          </div>
        ) : (
          logs.map((log) => {
            const badge = getActionBadge(log.action_type);
            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="font-semibold text-xs text-slate-200">
                      {log.client_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {log.details}
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-400 flex-shrink-0">
                  <div className="font-medium text-slate-300">
                    {log.officer_name} ({log.officer_role})
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
