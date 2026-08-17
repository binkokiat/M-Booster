import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Brain, 
  Layers, 
  Compass, 
  ShieldCheck, 
  Flame, 
  Eye, 
  Award, 
  Activity, 
  Search, 
  Download, 
  Upload, 
  ArrowLeft,
  CheckCircle2,
  Table
} from 'lucide-react';

interface InformationViewsProps {
  viewId: string; // 'import_info' | 'char1' | 'char2' | 'conceptual' | 'habit' | 'motivation' | 'awareness' | 'potential_graph' | 'activities'
  onBack: () => void;
}

export const InformationViews: React.FC<InformationViewsProps> = ({ viewId, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const viewTitles: Record<string, { title: string; subtitle: string; icon: any }> = {
    import_info: { title: 'Import / Export Information', subtitle: 'จัดการและนำเข้า/ส่งออกฐานข้อมูลความรู้ Mind Booster', icon: FileSpreadsheet },
    char1: { title: 'ลักษณะนิสัย 1 (Main Character)', subtitle: 'ตารางฐานข้อมูลลักษณะนิสัยหลักตามลายนิ้วมือ', icon: Brain },
    char2: { title: 'ลักษณะนิสัย 2 (Sub-character)', subtitle: 'ตารางข้อมูลความฉลาดทางอารมณ์และการปรับตัว', icon: Layers },
    conceptual: { title: 'ลักษณะทางความคิด (Conceptual Characteristics)', subtitle: 'ตารางข้อมูลกระบวนการคิดของสมองซีกซ้ายและซีกขวา', icon: Compass },
    habit: { title: 'คำแนะนำตามลักษณะนิสัย (Habit Recommendations)', subtitle: 'ตารางคำแนะนำการส่งเสริมศักยภาพและการเรียนรู้', icon: ShieldCheck },
    motivation: { title: 'แรงจูงใจในภาพรวม (Overall Motivation)', subtitle: 'ตารางปัจจัยกระตุ้นและแรงขับเคลื่อนในการพัฒนาตนเอง', icon: Flame },
    awareness: { title: 'ช่องทางการรับข้อมูล (Awareness Channels - VAK)', subtitle: 'ตารางสัดส่วนการรับรู้ผ่านการมอง การฟัง และการลงมือทำ', icon: Eye },
    potential_graph: { title: 'กราฟค่าศักยภาพและศักยภาพ 10 ด้าน', subtitle: 'ตารางเกณฑ์ค่าคะแนนและนิยามศักยภาพสมอง 10 พู', icon: Award },
    activities: { title: 'กิจกรรมตามค่าศักยภาพ (Activities by Potential)', subtitle: 'ตารางกิจกรรม งานอดิเรก และวิชาเรียนตามพหุปัญญา', icon: Activity },
  };

  const currentInfo = viewTitles[viewId] || viewTitles['char1'];
  const Icon = currentInfo.icon;

  // Sample data tables for knowledge base views
  const sampleRows = [
    { code: 'WT_01', category: 'Whorl Target', name: 'เป้าหมายแน่วแน่ มุ่งมั่นสู่ความสำเร็จ', detail: 'มีสมาธิสูง ชอบการแข่งขัน เป็นผู้นำที่เด็ดขาด', score: '95%' },
    { code: 'WS_02', category: 'Whorl Spiral', name: 'ความคิดสร้างสรรค์ มีเอกลักษณ์เฉพาะตัว', detail: 'ชอบความเป็นอิสระ ค้นหาวิธีการใหม่ๆ อยู่เสมอ', score: '90%' },
    { code: 'WD_03', category: 'Double Loop', name: 'มองรอบด้าน ยืดหยุ่นและปรับตัวเก่ง', detail: 'สามารถประสานงานได้ดี เข้าใจมุมมองที่หลากหลาย', score: '88%' },
    { code: 'UL_04', category: 'Ulnar Loop', name: 'เป็นมิตร เรียนรู้ผ่านการเลียนแบบและซึมซับ', detail: 'เข้ากับผู้อื่นได้ง่าย ชอบบรรยากาศการเรียนรู้ที่อบอุ่น', score: '85%' },
    { code: 'RL_05', category: 'Radial Loop', name: 'คิดนอกกรอบ มีความเป็นตัวของตัวเองสูง', detail: 'กล้าตั้งคำถาม มีแนวคิดที่แตกต่างและแปลกใหม่', score: '92%' },
    { code: 'AS_06', category: 'Simple Arch', name: 'รอบคอบ มั่นคง เรียนรู้อย่างเป็นขั้นเป็นตอน', detail: 'ต้องการความปลอดภัยและความชัดเจนในข้อมูล', score: '80%' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F9] p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-[#466BB2] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-[#466BB2] rounded-xl border border-blue-100">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{currentInfo.title}</h1>
              <p className="text-xs text-slate-500">{currentInfo.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert('ส่งออกข้อมูลตารางสำเร็จ')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-lg border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข้อมูลในตาราง..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#466BB2]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Information Knowledge Base Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#466BB2] text-white font-semibold">
                <th className="py-3 px-4 w-24">รหัส (Code)</th>
                <th className="py-3 px-4 w-36">หมวดหมู่</th>
                <th className="py-3 px-4">หัวข้อ / คุณลักษณะ</th>
                <th className="py-3 px-4">รายละเอียดเชิงลึก</th>
                <th className="py-3 px-4 text-center w-28">ค่าดัชนี</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sampleRows
                .filter(r => r.name.includes(searchQuery) || r.detail.includes(searchQuery) || r.code.includes(searchQuery))
                .map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#466BB2]">
                      {row.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed">
                      {row.detail}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {row.score}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
