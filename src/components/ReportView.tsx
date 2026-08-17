import React, { useState } from 'react';
import { ClientProfile, MindBoosterAnalysisReport } from '../types';
import { 
  ArrowLeft, 
  Printer, 
  Mail, 
  Download, 
  Brain, 
  Layers, 
  Compass, 
  ShieldCheck, 
  Flame, 
  Eye, 
  Award, 
  Activity, 
  CheckCircle2,
  Sparkles,
  Share2
} from 'lucide-react';
import { calculateComprehensiveReport } from '../utils/dermatoglyphics';

interface ReportViewProps {
  client: ClientProfile;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ client, onBack }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [emailSent, setEmailSent] = useState(false);

  // Generate dynamic report data based on client fingerprints
  const report: MindBoosterAnalysisReport = calculateComprehensiveReport(client, {});

  const tabs = [
    { name: 'ลักษณะนิสัย 1', icon: Brain },
    { name: 'ลักษณะนิสัย 2', icon: Layers },
    { name: 'ลักษณะทางความคิด', icon: Compass },
    { name: 'คำแนะนำตามลักษณะนิสัย', icon: ShieldCheck },
    { name: 'แรงจูงใจในภาพรวม', icon: Flame },
    { name: 'ช่องทางการรับข้อมูล', icon: Eye },
    { name: 'กราฟค่าศักยภาพ', icon: Award },
    { name: 'ศักยภาพ 10 ด้าน', icon: Award },
    { name: 'กิจกรรมตามค่าศักยภาพ', icon: Activity },
  ];

  const handleSendEmail = () => {
    setEmailSent(true);
    alert(`ส่งรายงานการวิเคราะห์ไปยังอีเมล ${client.email || 'ของลูกค้า'} เรียบร้อยแล้ว`);
    setTimeout(() => setEmailSent(false), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F6F8F9] p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-[#466BB2] hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              รายงานของ {client.first_name === '' || client.last_name === '' ? client.nick_name : `${client.first_name} ${client.last_name}`}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Client ID: {client.user_id_code} | TRC: {report.trc_score} | ความเร็วในการเรียนรู้: {report.learning_speed_index}
            </p>
          </div>
        </div>

        {/* Action Buttons: Email & Print */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSendEmail}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#466BB2] hover:bg-[#3b5998] text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>ส่งอีเมลรายงาน</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน (Print)</span>
          </button>
        </div>
      </div>

      {/* Main Report Container with Vertical Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 space-y-1 shrink-0">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            หมวดหมู่การประเมิน
          </div>
          {tabs.map((t, idx) => {
            const Icon = t.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`w-full text-left px-3.5 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-3 ${
                  isActive
                    ? 'bg-[#466BB2] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#466BB2]'}`} />
                <span className="truncate">{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Pane */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          
          {/* Tab 0: ลักษณะนิสัย 1 */}
          {activeTab === 0 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">ลักษณะนิสัยที่ 1 (Main Character & Dominance)</h2>
                <p className="text-xs text-slate-500 mt-1">วิเคราะห์ลักษณะบุคลิกภาพหลักและรูปแบบการตอบสนองต่อสิ่งแวดล้อม</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100 space-y-3">
                  <span className="text-xs font-bold text-[#466BB2] uppercase tracking-wider">บุคลิกภาพเด่นตามลายนิ้วโป้ง</span>
                  <h3 className="text-lg font-bold text-slate-900">{report.disc_profile.primary_type}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {report.disc_profile.personality_summary}
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">การกระจายตัวของบุคลิกภาพ DISC</span>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>D (Dominance - ความเป็นผู้นำ/มุ่งผลลัพธ์)</span>
                        <span>{report.disc_profile.dominant}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${report.disc_profile.dominant}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>I (Influence - การมีปฏิสัมพันธ์/มนุษยสัมพันธ์)</span>
                        <span>{report.disc_profile.influential}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${report.disc_profile.influential}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>S (Steadiness - ความมั่นคง/ความเห็นอกเห็นใจ)</span>
                        <span>{report.disc_profile.steady}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${report.disc_profile.steady}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>C (Compliance - ความรอบคอบ/กฎเกณฑ์)</span>
                        <span>{report.disc_profile.compliant}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${report.disc_profile.compliant}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: ลักษณะนิสัย 2 */}
          {activeTab === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">ลักษณะนิสัยที่ 2 (Sub-character & Adaptation)</h2>
                <p className="text-xs text-slate-500 mt-1">วิเคราะห์ความยืดหยุ่นในการปรับตัวและการควบคุมอารมณ์</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <h4 className="text-sm font-bold text-purple-900 mb-2">ความฉลาดทางอารมณ์ (EQ)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    มีความสามารถในการรับรู้อารมณ์ของตนเองและผู้อื่นในระดับสูง สามารถจัดการกับความเครียดได้เป็นอย่างดี
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-900 mb-2">ความสามารถในการปรับตัว (AQ)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    มีความยืดหยุ่นสูงเมื่อเผชิญกับสถานการณ์ที่ไม่คาดคิด สามารถมองหาทางเลือกใหม่ๆ ในการแก้ไขปัญหาได้อย่างรวดเร็ว
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">แรงขับเคลื่อนภายใน (Drive)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    มุ่งเน้นการพัฒนาตนเองอย่างต่อเนื่อง ให้ความสำคัญกับความก้าวหน้าและการสร้างคุณค่าในสิ่งที่ทำ
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: ลักษณะทางความคิด */}
          {activeTab === 2 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">ลักษณะทางความคิด (Conceptual Characteristics)</h2>
                <p className="text-xs text-slate-500 mt-1">กระบวนการคิดเชิงวิเคราะห์และการประมวลผลข้อมูลของสมอง</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">สมองซีกซ้าย (Left Hemisphere - Logic & Step-by-step)</h3>
                  <div className="text-xs text-slate-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>การคิดเชิงตรรกะและเหตุผลเป็นลำดับขั้นตอน</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>การวิเคราะห์ข้อมูลตัวเลขและสถิติ</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>ความแม่นยำด้านไวยากรณ์และการเรียบเรียงภาษา</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">สมองซีกขวา (Right Hemisphere - Creativity & Big Picture)</h3>
                  <div className="text-xs text-slate-600 space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#466BB2] shrink-0" />
                      <span>ความคิดสร้างสรรค์และจินตนาการนอกกรอบ</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#466BB2] shrink-0" />
                      <span>การมองภาพรวมแบบองค์รวม (Big Picture Thinking)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-[#466BB2] shrink-0" />
                      <span>ความเข้าใจในศิลปะ ดนตรี และมิติสัมพันธ์</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: คำแนะนำตามลักษณะนิสัย */}
          {activeTab === 3 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">คำแนะนำตามลักษณะนิสัย (Recommendations)</h2>
                <p className="text-xs text-slate-500 mt-1">แนวทางการส่งเสริมการเรียนรู้และการพัฒนาศักยภาพเฉพาะบุคคล</p>
              </div>

              <div className="space-y-3">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#466BB2] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: แรงจูงใจในภาพรวม */}
          {activeTab === 4 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">แรงจูงใจในภาพรวม (Overall Motivation)</h2>
                <p className="text-xs text-slate-500 mt-1">ปัจจัยกระตุ้นและแรงบันดาลใจหลักในการลงมือทำ</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm mb-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>เป้าหมายและความสำเร็จ (Achievement Oriented)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    มีแรงจูงใจสูงเมื่อมีเป้าหมายที่ชัดเจนและวัดผลได้ ชอบความท้าทายและการก้าวข้ามขีดจำกัดของตนเอง
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm mb-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>การยอมรับและการชื่นชม (Recognition)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ตอบสนองต่อคำชมเชยที่จริงใจและการเห็นคุณค่าในผลงาน ช่วยเพิ่มพลังในการทำงานได้อย่างมีนัยสำคัญ
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: ช่องทางการรับข้อมูล (Awareness Channel) */}
          {activeTab === 5 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">ช่องทางการรับข้อมูล (Awareness Channels - VAK)</h2>
                <p className="text-xs text-slate-500 mt-1">สัดส่วนรูปแบบการเปิดรับข้อมูลผ่านการมองเห็น การได้ยิน และการลงมือปฏิบัติจริง</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs text-center flex flex-col items-center p-4">
                  <img 
                    src="/assets/images/report/cn-visual.png" 
                    alt="Visual" 
                    className="h-32 object-contain my-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <h3 className="font-bold text-slate-800 text-sm mt-2">ผ่านการมองเห็น (Visual)</h3>
                  <div className="text-2xl font-black text-[#466BB2] my-2">{report.learning_style.visual}%</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    เรียนรู้ได้ดีที่สุดผ่านภาพ แผนภูมิ วิดีโอ และการจดบันทึกด้วยสีสัน
                  </p>
                </div>

                {/* Auditory */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs text-center flex flex-col items-center p-4">
                  <img 
                    src="/assets/images/report/cn-auditory.jpg" 
                    alt="Auditory" 
                    className="h-32 object-contain my-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <h3 className="font-bold text-slate-800 text-sm mt-2">ผ่านการได้ยิน (Auditory)</h3>
                  <div className="text-2xl font-black text-[#FFC312] my-2">{report.learning_style.auditory}%</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    เรียนรู้ผ่านการฟังบรรยาย การสนทนาแลกเปลี่ยน และการอ่านออกเสียง
                  </p>
                </div>

                {/* Kinesthetic */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs text-center flex flex-col items-center p-4">
                  <img 
                    src="/assets/images/report/cn-kinesthetic.jpg" 
                    alt="Kinesthetic" 
                    className="h-32 object-contain my-2"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <h3 className="font-bold text-slate-800 text-sm mt-2">ผ่านการลงมือทำ (Kinesthetic)</h3>
                  <div className="text-2xl font-black text-emerald-600 my-2">{report.learning_style.kinesthetic}%</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    เรียนรู้ผ่านการทดลองปฏิบัติ การเคลื่อนไหว และการมีส่วนร่วมในกิจกรรม
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Tab 6: กราฟค่าศักยภาพ */}
          {activeTab === 6 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">กราฟค่าศักยภาพสมอง (Potential Distribution)</h2>
                <p className="text-xs text-slate-500 mt-1">เปรียบเทียบระดับศักยภาพของสมองแต่ละพู</p>
              </div>

              <div className="space-y-4">
                {report.brain_lobes.map((lobe, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-slate-800 text-sm">
                        {lobe.lobe_name_th} ({lobe.lobe_name})
                      </div>
                      <div className="text-xs font-semibold text-[#466BB2]">
                        ซ้าย: {lobe.finger_left} ({lobe.left_score}) | ขวา: {lobe.finger_right} ({lobe.right_score})
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-200">
                      <div>
                        <strong className="text-slate-700">สมองซีกซ้าย:</strong> {lobe.left_functions.join(', ')}
                      </div>
                      <div>
                        <strong className="text-slate-700">สมองซีกขวา:</strong> {lobe.right_functions.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 7: ศักยภาพ 10 ด้าน (Potential 10 Sides with illustrations) */}
          {activeTab === 7 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">ศักยภาพ 10 ด้าน (10 Brain Potential Sides)</h2>
                <p className="text-xs text-slate-500 mt-1">การวิเคราะห์ความสามารถเฉพาะด้านสอดคล้องกับลายนิ้วมือทั้ง 10 นิ้ว</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { finger: 'L1', name: 'ศักยภาพด้านความเป็นผู้นำและการจัดการตนเอง', img: '/assets/images/report/ศักยภาพ-10-ด้าน-L1.jpg', desc: 'ความสามารถในการตั้งเป้าหมาย วิสัยทัศน์ และการสร้างแรงบันดาลใจ' },
                  { finger: 'L2', name: 'ศักยภาพด้านความคิดสร้างสรรค์และจินตนาการ', img: '/assets/images/report/ศักยภาพ-10-ด้าน-L2.jpg', desc: 'ความสามารถในการคิดนอกกรอบ มิติสัมพันธ์ และแนวคิดใหม่ๆ' },
                  { finger: 'L3', name: 'ศักยภาพด้านการควบคุมร่างกายและการเคลื่อนไหว', img: '/assets/images/report/ศักยภาพ-10-ด้าน-L3.jpg', desc: 'ทักษะทางกีฬา จังหวะการเคลื่อนไหว และการประสานงานของร่างกาย' },
                  { finger: 'L4', name: 'ศักยภาพด้านสุนทรียศาสตร์และการฟัง', img: '/assets/images/report/ศักยภาพ-10-ด้าน-L4.jpg', desc: 'การรับรู้โทนเสียง จังหวะดนตรี และการจับอารมณ์จากเสียง' },
                  { finger: 'L5', name: 'ศักยภาพด้านการสังเกตและความจำภาพ', img: '/assets/images/report/ศักยภาพ-10-ด้าน-L5.jpg', desc: 'การจดจำใบหน้า ภาพ สีสัน และความละเอียดอ่อนทางสายตา' },
                  { finger: 'R1', name: 'ศักยภาพด้านการบริหารจัดการและความสัมพันธ์', img: '/assets/images/report/ศักยภาพ-10-ด้าน-R1.jpg', desc: 'ความเข้าใจผู้คน การสื่อสารโน้มน้าวใจ และการทำงานเป็นทีม' },
                  { finger: 'R2', name: 'ศักยภาพด้านตรรกะและการวิเคราะห์เชิงเหตุผล', img: '/assets/images/report/ศักยภาพ-10-ด้าน-R2.jpg', desc: 'การคำนวณ การคิดเชิงวิเคราะห์ และการแก้ไขปัญหาอย่างเป็นระบบ' },
                  { finger: 'R3', name: 'ศักยภาพด้านกล้ามเนื้อมัดเล็กและความประณีต', img: '/assets/images/report/ศักยภาพ-10-ด้าน-R3.jpg', desc: 'ความประณีตในการประดิษฐ์ งานฝีมือ และการใช้อุปกรณ์ที่ต้องการความละเอียด' },
                  { finger: 'R4', name: 'ศักยภาพด้านภาษาและการสื่อความหมาย', img: '/assets/images/report/ศักยภาพ-10-ด้าน-R4.jpg', desc: 'ทักษะการเลือกใช้คำ การพูดในที่สาธารณะ และการถ่ายทอดความคิด' },
                  { finger: 'R5', name: 'ศักยภาพด้านการมองเห็นเชิงโครงสร้างและการอ่าน', img: '/assets/images/report/ศักยภาพ-10-ด้าน-R5.jpg', desc: 'การวิเคราะห์แผนผัง แผนที่ และการอ่านทำความเข้าใจข้อมูลเชิงลึก' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex space-x-4 items-start">
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#466BB2] text-white">
                          {item.finger}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 8: กิจกรรมตามค่าศักยภาพ */}
          {activeTab === 8 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-bold text-[#466BB2]">กิจกรรมตามค่าศักยภาพ (Activities by Potential)</h2>
                <p className="text-xs text-slate-500 mt-1">ข้อเสนอแนะกิจกรรม งานอดิเรก และวิชาเรียนที่เหมาะสมในการส่งเสริมศักยภาพสูงสุด</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.multiple_intelligences.map((mi, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">{mi.category_th}</h4>
                      <span className="text-xs font-bold text-[#466BB2] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        คะแนน {mi.score}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{mi.description}</p>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500">กิจกรรมและอาชีพที่แนะนำ:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mi.suggestedCareers.map((c, cIdx) => (
                          <span key={cIdx} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
