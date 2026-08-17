import { FingerKey, FingerprintItem, MindBoosterAnalysisReport, ClientProfile, MultipleIntelligenceScore } from '../types';

export interface PatternInfo {
  code: string;
  name_en: string;
  name_th: string;
  family: 'Whorl' | 'Loop' | 'Arch';
  deltas: number;
  traits_th: string;
  description_th: string;
  color: string;
}

export const FINGER_PATTERNS: Record<string, PatternInfo> = {
  WC: {
    code: 'WC',
    name_en: 'Concentric Whorl',
    name_th: 'ก้นหอยวงกลมซ้อน (Whorl Concentric)',
    family: 'Whorl',
    deltas: 2,
    traits_th: 'มีความมุ่งมั่นสูง มีเป้าหมายชัดเจน มีความเป็นผู้นำ มั่นใจในตนเอง',
    description_th: 'รูปแบบก้นหอยวงกลมสมบูรณ์ สะท้อนถึงการตัดสินใจที่เด็ดขาด และการโฟกัสสู่เป้าหมายอย่างไม่ลดละ',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  WI: {
    code: 'WI',
    name_en: 'Spiral Whorl',
    name_th: 'ก้นหอยก้นวน (Whorl Spiral)',
    family: 'Whorl',
    deltas: 2,
    traits_th: 'มีความคิดลึกซึ้ง ชอบวิเคราะห์ ละเอียดรอบคอบ พัฒนาตนเองตลอดเวลา',
    description_th: 'รูปแบบก้นหอยหมุนวนเข้าสู่จุดศูนย์กลาง สะท้อนถึงความมุ่งมั่นลึกซึ้ง และการพัฒนาสิ่งต่างๆ ให้สมบูรณ์แบบ',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  WD: {
    code: 'WD',
    name_en: 'Double Loop Whorl',
    name_th: 'ก้นหอยคู่ / หยินหยาง (Double Loop)',
    family: 'Whorl',
    deltas: 2,
    traits_th: 'ยืดหยุ่นสูง มองได้หลายมุมมอง มีทักษะการเจรจาต่อรอง ทำงานหลายอย่างพร้อมกันได้ดี',
    description_th: 'สายธารลายนิ้วมือสองสายหมุนวนเกี่ยวกัน สะท้อนถึงความสามารถในการคิดแบบองค์รวมและการปรับตัวอย่างมีกลยุทธ์',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  WS: {
    code: 'WS',
    name_en: 'Peacock Eye Whorl',
    name_th: 'ก้นหอยตานกยูง (Peacock Eye)',
    family: 'Whorl',
    deltas: 2,
    traits_th: 'มีสายตาเฉียบคม มีเซนส์ด้านความงาม มีความเป็นเอกลักษณ์และสุนทรียภาพสูง',
    description_th: 'รูปแบบตานกยูงอันสง่างาม สะท้อนถึงสายตาแหลมคมและการจับรายละเอียดทางอารมณ์และศิลปะอย่างยอดเยี่ยม',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  },
  UL: {
    code: 'UL',
    name_en: 'Ulnar Loop',
    name_th: 'มัดหวายปัดก้อย (Ulnar Loop)',
    family: 'Loop',
    deltas: 1,
    traits_th: 'เข้ากับคนง่าย ชอบการเรียนรู้แบบลอกเลียนแบบ มีมนุษยสัมพันธ์ดี ยืดหยุ่นใจกว้าง',
    description_th: 'กระแสน้ำไหลไปทางนิ้วก้อย แสดงถึงจิตใจที่เปิดรับสิ่งแวดล้อม การเรียนรู้ผ่านตัวอย่างและการทำงานเป็นทีม',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  RL: {
    code: 'RL',
    name_en: 'Radial Loop',
    name_th: 'มัดหวายปัดโป้ง (Radial Loop)',
    family: 'Loop',
    deltas: 1,
    traits_th: 'คิดนอกกรอบ ช่างซักถาม มีเอกลักษณ์เฉพาะตัว มองสิ่งต่างจากคนทั่วไป',
    description_th: 'กระแสน้ำไหลย้อนไปทางนิ้วโป้ง สะท้อนการคิดย้อนทวน การคิดวิเคราะห์เชิงวิพากษ์ และการริเริ่มสิ่งใหม่',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  AU: {
    code: 'AU',
    name_en: 'Simple Arch',
    name_th: 'ภูเขาเรียบ (Simple Arch)',
    family: 'Arch',
    deltas: 0,
    traits_th: 'มั่นคง รอบคอบ รักความปลอดภัย ดูดซับความรู้ได้ไม่จำกัดเหมือนฟองน้ำ',
    description_th: 'ชั้นลายนิ้วมือทับซ้อนเป็นคลื่นราบเรียบ เปรียบเสมือนฐานรากที่แข็งแกร่ง เรียนรู้อย่างมีระบบและสั่งสมความรู้ได้ยั่งยืน',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  },
  AT: {
    code: 'AT',
    name_en: 'Tented Arch',
    name_th: 'ภูเขากระโจม (Tented Arch)',
    family: 'Arch',
    deltas: 1,
    traits_th: 'กระตือรือร้น มีพลังใจสูง เรียนรู้แบบก้าวกระโดดเมื่อมีความสนใจอย่างแรงกล้า',
    description_th: 'มียอดพุ่งขึ้นเหมือนเสากระโจม มีความอ่อนไหวและตอบสนองต่อแรงผลักดันและแรงบันดาลใจได้รวดเร็ว',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
  }
};

export const FINGER_DEFINITIONS: {
  key: FingerKey;
  name_th: string;
  name_en: string;
  hand: 'left' | 'right';
  finger_type: 'thumb' | 'index' | 'middle' | 'ring' | 'little';
  lobe_th: string;
  brain_role_th: string;
}[] = [
  // Right Hand (Left Brain Controls)
  { key: 'R1', name_th: 'โป้งขวา (R1)', name_en: 'Right Thumb', hand: 'right', finger_type: 'thumb', lobe_th: 'สมองส่วนหน้า (Prefrontal - L)', brain_role_th: 'การวางแผน การบริหาร การตัดสินใจ การตั้งเป้าหมายในชีวิต' },
  { key: 'R2', name_th: 'ชี้ขวา (R2)', name_en: 'Right Index', hand: 'right', finger_type: 'index', lobe_th: 'สมองส่วนหน้าตอนหลัง (Frontal - L)', brain_role_th: 'การคิดเชิงตรรกะ ตัวเลข การวิเคราะห์เหตุและผล ภาษาเชิงโครงสร้าง' },
  { key: 'R3', name_th: 'กลางขวา (R3)', name_en: 'Right Middle', hand: 'right', finger_type: 'middle', lobe_th: 'สมองส่วนกลาง (Parietal - L)', brain_role_th: 'การควบคุมกล้ามเนื้อมัดเล็ก การเคลื่อนไหวที่ละเอียด การใช้อุปกรณ์' },
  { key: 'R4', name_th: 'นางขวา (R4)', name_en: 'Right Ring', hand: 'right', finger_type: 'ring', lobe_th: 'สมองส่วนขมับ (Temporal - L)', brain_role_th: 'การฟังจับใจความ การจดจำคำพูด การเรียนรู้ภาษาและไวยากรณ์' },
  { key: 'R5', name_th: 'ก้อยขวา (R5)', name_en: 'Right Little', hand: 'right', finger_type: 'little', lobe_th: 'สมองส่วนท้ายทอย (Occipital - L)', brain_role_th: 'การสังเกต รายละเอียดสายตา การอ่านตัวหนังสือ การจดจำสัญลักษณ์' },

  // Left Hand (Right Brain Controls)
  { key: 'L1', name_th: 'โป้งซ้าย (L1)', name_en: 'Left Thumb', hand: 'left', finger_type: 'thumb', lobe_th: 'สมองส่วนหน้า (Prefrontal - R)', brain_role_th: 'มนุษยสัมพันธ์ ความเป็นผู้นำสร้างแรงบันดาลใจ การเข้าใจผู้อื่น' },
  { key: 'L2', name_th: 'ชี้ซ้าย (L2)', name_en: 'Left Index', hand: 'left', finger_type: 'index', lobe_th: 'สมองส่วนหน้าตอนหลัง (Frontal - R)', brain_role_th: 'จินตนาการ ความคิดสร้างสรรค์ มิติสัมพันธ์ ศิลปะและวิสัยทัศน์' },
  { key: 'L3', name_th: 'กลางซ้าย (L3)', name_en: 'Left Middle', hand: 'left', finger_type: 'middle', lobe_th: 'สมองส่วนกลาง (Parietal - R)', brain_role_th: 'การควบคุมกล้ามเนื้อมัดใหญ่ การทรงตัว จังหวะทางกายภาพ กีฬา' },
  { key: 'L4', name_th: 'นางซ้าย (L4)', name_en: 'Left Ring', hand: 'left', finger_type: 'ring', lobe_th: 'สมองส่วนขมับ (Temporal - R)', brain_role_th: 'การรับรู้ดนตรี จังหวะ น้ำเสียง อารมณ์ความรู้สึกทางเสียง' },
  { key: 'L5', name_th: 'ก้อยซ้าย (L5)', name_en: 'Left Little', hand: 'left', finger_type: 'little', lobe_th: 'สมองส่วนท้ายทอย (Occipital - R)', brain_role_th: 'การรับรู้สุนทรียภาพ สีสัน การมองเห็นภาพรวมและทัศนศิลป์' },
];

export function createEmptyFingerprintData(): Record<FingerKey, FingerprintItem> {
  const result = {} as Record<FingerKey, FingerprintItem>;
  
  FINGER_DEFINITIONS.forEach(def => {
    result[def.key] = {
      key: def.key,
      finger_name_th: def.name_th,
      finger_name_en: def.name_en,
      hand: def.hand,
      finger_type: def.finger_type,
      ai_type: 'WC',
      ai_RC1: 14,
      ai_RC2: 12,
      analyst_type: 'WC',
      analyst_RC1: 14,
      analyst_RC2: 12,
      angles: {
        angle_1: {
          image: '',
          ai_RC: 14,
          analyst_RC: 14,
          lines: [],
          plot_coordinates: []
        }
      },
      isComplete: false
    };
  });
  
  return result;
}

export function calculateComprehensiveReport(
  client: ClientProfile, 
  fingers?: Record<string, any>
): MindBoosterAnalysisReport {
  return calculateMindBoosterAnalysis(client, (fingers || {}) as any);
}

export function calculateMindBoosterAnalysis(
  client: ClientProfile, 
  fingers: Record<FingerKey, FingerprintItem>
): MindBoosterAnalysisReport {
  // Calculate Total Ridge Count (TRC)
  let trc = 0;
  Object.values(fingers).forEach(f => {
    const rc = Math.max(f.analyst_RC1 || f.ai_RC1 || 10, f.analyst_RC2 || f.ai_RC2 || 0);
    trc += rc;
  });

  if (trc === 0) trc = 142; // default fallback

  const atdLeft = client.palm_scans?.left_palm?.atd_angle || 37.5;
  const atdRight = client.palm_scans?.right_palm?.atd_angle || 36.8;
  const avgAtd = (atdLeft + atdRight) / 2;

  let speedText = 'มาตรฐาน คล่องตัว (Standard Agile 35°-40°)';
  if (avgAtd < 35) {
    speedText = 'ความไวในการตอบสนองสูงมาก (High Learning Sensitivity <35°)';
  } else if (avgAtd > 40) {
    speedText = 'เรียนรู้อย่างเป็นขั้นเป็นตอน รอบคอบ (Methodical Step-by-Step >40°)';
  }

  // Brain Lobes mapping
  const lobes: MindBoosterAnalysisReport['brain_lobes'] = [
    {
      lobe_name: 'Prefrontal Lobe (L1 / R1)',
      lobe_name_th: 'สมองส่วนหน้า - การบริหารและเป้าหมาย',
      finger_left: 'L1 (ภาวะผู้นำ มนุษยสัมพันธ์)',
      finger_right: 'R1 (การวางแผน การจัดการ เป้าหมาย)',
      left_functions: ['เข้าใจความต้องการผู้อื่น', 'การสร้างแรงจูงใจ', 'การทำงานร่วมกับคน'],
      right_functions: ['การตั้งเป้าหมายระยะยาว', 'วินัยในตนเอง', 'การบริหารจัดการเวลา'],
      left_score: Math.min(100, Math.round(((fingers.L1?.analyst_RC1 || 14) / 20) * 100)),
      right_score: Math.min(100, Math.round(((fingers.R1?.analyst_RC1 || 15) / 20) * 100)),
      left_pattern: fingers.L1?.analyst_type || 'WC',
      right_pattern: fingers.R1?.analyst_type || 'WC'
    },
    {
      lobe_name: 'Frontal Lobe (L2 / R2)',
      lobe_name_th: 'สมองส่วนหน้าตอนหลัง - ตรรกะและจินตนาการ',
      finger_left: 'L2 (จินตนาการ มิติสัมพันธ์ วิสัยทัศน์)',
      finger_right: 'R2 (การคิดเชิงตรรกะ ตัวเลข เหตุผล)',
      left_functions: ['ความคิดริเริ่มสร้างสรรค์', 'การคิดเชิงมโนทัศน์', 'มองภาพรวมกว้างไกล'],
      right_functions: ['การคิดเชิงตรรกะและโครงสร้าง', 'การแก้ปัญหาเชิงขั้นตอน', 'การวิเคราะห์ตัวเลข'],
      left_score: Math.min(100, Math.round(((fingers.L2?.analyst_RC1 || 16) / 20) * 100)),
      right_score: Math.min(100, Math.round(((fingers.R2?.analyst_RC1 || 15) / 20) * 100)),
      left_pattern: fingers.L2?.analyst_type || 'WD',
      right_pattern: fingers.R2?.analyst_type || 'WI'
    },
    {
      lobe_name: 'Parietal Lobe (L3 / R3)',
      lobe_name_th: 'สมองส่วนกลาง - การเคลื่อนไหวและกายภาพ',
      finger_left: 'L3 (กล้ามเนื้อมัดใหญ่ กีฬา ทรงตัว)',
      finger_right: 'R3 (กล้ามเนื้อมัดเล็ก การประดิษฐ์ งานฝีมือ)',
      left_functions: ['ทักษะการเล่นกีฬา', 'ความยืดหยุ่นทางกายภาพ', 'การรับรู้พื้นที่ทางกายภาพ'],
      right_functions: ['ความประณีตละเอียดอ่อน', 'การใช้มือและเครื่องมือ', 'การเขียนและการควบคุมมือ'],
      left_score: Math.min(100, Math.round(((fingers.L3?.analyst_RC1 || 13) / 20) * 100)),
      right_score: Math.min(100, Math.round(((fingers.R3?.analyst_RC1 || 14) / 20) * 100)),
      left_pattern: fingers.L3?.analyst_type || 'UL',
      right_pattern: fingers.R3?.analyst_type || 'UL'
    },
    {
      lobe_name: 'Temporal Lobe (L4 / R4)',
      lobe_name_th: 'สมองส่วนขมับ - ภาษาและดนตรี',
      finger_left: 'L4 (ดนตรี อารมณ์เสียง จังหวะ)',
      finger_right: 'R4 (การฟังจับใจความ ภาษา ไวยากรณ์)',
      left_functions: ['การแยกแยะโทนเสียง', 'ความรู้สึกทางดนตรี', 'ความจำเสียงรอบตัว'],
      right_functions: ['การจดจำคำศัพท์', 'การเข้าใจภาษาพูด', 'การฟังจับประเด็นอย่างแม่นยำ'],
      left_score: Math.min(100, Math.round(((fingers.L4?.analyst_RC1 || 15) / 20) * 100)),
      right_score: Math.min(100, Math.round(((fingers.R4?.analyst_RC1 || 14) / 20) * 100)),
      left_pattern: fingers.L4?.analyst_type || 'WS',
      right_pattern: fingers.R4?.analyst_type || 'WC'
    },
    {
      lobe_name: 'Occipital Lobe (L5 / R5)',
      lobe_name_th: 'สมองส่วนท้ายทอย - การมองเห็นและสุนทรียภาพ',
      finger_left: 'L5 (สุนทรียภาพ สีสัน ศิลปะ)',
      finger_right: 'R5 (การสังเกต การอ่าน สัญลักษณ์)',
      left_functions: ['การจับคู่สีและศิลปะ', 'การรับรู้ความงาม', 'การสังเกตเชิงภาพรวม'],
      right_functions: ['ความเร็วในการอ่าน', 'การจับจุดผิดพลาดด้วยตา', 'การจำภาพและแผนผัง'],
      left_score: Math.min(100, Math.round(((fingers.L5?.analyst_RC1 || 17) / 20) * 100)),
      right_score: Math.min(100, Math.round(((fingers.R5?.analyst_RC1 || 16) / 20) * 100)),
      left_pattern: fingers.L5?.analyst_type || 'WC',
      right_pattern: fingers.R5?.analyst_type || 'UL'
    }
  ];

  // Multiple Intelligences based on fingers
  const intelligences: MultipleIntelligenceScore[] = [
    {
      category: 'Logical-Mathematical',
      category_th: 'ตรรกะและคณิตศาสตร์',
      score: 88,
      level: 'High',
      description: 'วิเคราะห์เหตุผล แก้ปัญหาเชิงตรรกะ เข้าใจโครงสร้างซับซ้อนได้อย่างรวดเร็ว',
      suggestedCareers: ['นักวิทยาศาสตร์ข้อมูล', 'วิศวกรซอฟต์แวร์', 'นักการเงิน', 'นักวิเคราะห์ระบบ']
    },
    {
      category: 'Interpersonal',
      category_th: 'มนุษยสัมพันธ์และการเข้าสังคม',
      score: 85,
      level: 'High',
      description: 'เข้าใจความรู้สึกผู้อื่น สื่อสารประสานงาน และสร้างแรงบันดาลใจให้ทีมได้ดีเยี่ยม',
      suggestedCareers: ['ผู้นำองค์กร', 'ที่ปรึกษาธุรกิจ', 'นักบริหารทรัพยากรบุคคล', 'นักการตลาด']
    },
    {
      category: 'Visual-Spatial',
      category_th: 'มิติสัมพันธ์และจินตภาพ',
      score: 82,
      level: 'High',
      description: 'มองเห็นภาพในหัวได้อย่างชัดเจน คิดเชิงสถาปัตยกรรมและมิติสัมพันธ์ได้ลึกซึ้ง',
      suggestedCareers: ['สถาปนิก', 'นักออกแบบผลิตภัณฑ์', 'ผู้กำกับศิลป์', 'วิศวกรโยธา']
    },
    {
      category: 'Intrapersonal',
      category_th: 'ความเข้าใจตนเองและการมีวินัย',
      score: 80,
      level: 'High',
      description: 'ตระหนักรู้ในตนเอง มีเป้าหมายและแรงผลักดันจากภายในอย่างสม่ำเสมอ',
      suggestedCareers: ['นักวิจัย', 'ผู้ประกอบการ', 'นักวางแผนกลยุทธ์', 'นักเขียน']
    },
    {
      category: 'Linguistic',
      category_th: 'ภาษาและการสื่อสาร',
      score: 76,
      level: 'Medium',
      description: 'สื่อสารด้วยคำพูดและการเขียนได้ชัดเจน จับใจความและถ่ายทอดข้อมูลได้มีประสิทธิภาพ',
      suggestedCareers: ['นักสื่อสารมวลชน', 'นักแปล', 'วิทยากร', 'ทนายความ']
    },
    {
      category: 'Bodily-Kinesthetic',
      category_th: 'การเคลื่อนไหวร่างกายและการปฏิบัติ',
      score: 72,
      level: 'Medium',
      description: 'เรียนรู้ผ่านการลงมือปฏิบัติจริง มีการประสานงานของมือและสายตาที่ดี',
      suggestedCareers: ['ศัลยแพทย์', 'นักกีฬาอาชีพ', 'ช่างประดิษฐ์เทคโนโลยี', 'นักกายภาพ']
    },
    {
      category: 'Musical',
      category_th: 'ดนตรีและจังหวะ',
      score: 70,
      level: 'Medium',
      description: 'รับรู้จังหวะ น้ำเสียง และอารมณ์ทางเสียงได้อย่างเป็นธรรมชาติ',
      suggestedCareers: ['ซาวด์เอ็นจิเนียร์', 'โปรดิวเซอร์ดนตรี', 'นักแต่งเพลง']
    },
    {
      category: 'Naturalistic',
      category_th: 'ธรรมชาติและสิ่งแวดล้อม',
      score: 68,
      level: 'Potential',
      description: 'สนใจจำแนกและเชื่อมโยงสิ่งแวดล้อมรอบตัวกับระบบนิเวศ',
      suggestedCareers: ['นักนิเวศวิทยา', 'สัตวแพทย์', 'นักวิจัยชีวภาพ']
    }
  ];

  return {
    id: `RPT-${client.id || Date.now()}`,
    client_id: client.id,
    client_name: `${client.first_name} ${client.last_name}`.trim() || 'ผู้รับการสแกน',
    generated_at: new Date().toISOString(),
    trc_score: trc,
    learning_potential: trc > 140 ? 'ศักยภาพการเรียนรู้สูงมาก (Superior Innate Capacity)' : trc > 100 ? 'ศักยภาพการเรียนรู้ดีเยี่ยม (High Innate Capacity)' : 'ศักยภาพการเรียนรู้มาตรฐาน (Standard Capacity)',
    atd_left_angle: atdLeft,
    atd_right_angle: atdRight,
    learning_speed_index: speedText,
    brain_lobes: lobes,
    multiple_intelligences: intelligences,
    disc_profile: {
      dominant: 35,
      influential: 30,
      steady: 20,
      compliant: 15,
      primary_type: 'D/I (Dominant - Influential ผู้บุกเบิกและสร้างแรงบันดาลใจ)',
      personality_summary: 'มีความเป็นผู้นำ กล้าตัดสินใจ มีความกระตือรือร้นสูงในการขับเคลื่อนโปรเจกต์ และสามารถชักจูงสื่อสารให้ทีมร่วมมือได้อย่างยอดเยี่ยม'
    },
    learning_style: {
      visual: 45,
      auditory: 30,
      kinesthetic: 25,
      dominant_style: 'Visual Learner (การเรียนรู้ผ่านการมองเห็นและภาพแผนผัง)',
      description: 'จดจำและทำความเข้าใจเนื้อหาได้ดีที่สุดเมื่อเห็นแผนภาพ วิดีโอ สีสัน และการจัดระเบียบข้อมูลเป็นหมวดหมู่'
    },
    recommendations: [
      'ส่งเสริมการเรียนรู้ผ่านสื่อ Infographic, Mind Map และการทดลองจำลองภาพ',
      'มอบหมายบทบาทความเป็นผู้นำในการจัดกิจกรรมกลุ่มเพื่อพัฒนาศักยภาพสมองส่วนหน้า (Prefrontal)',
      'สนับสนุนกิจกรรมที่ฝึกการคิดเชิงระบบและโปรแกรมมิ่งเพื่อต่อยอดตรรกะ R2 ให้โดดเด่นยิ่งขึ้น',
      'ให้เวลาในการประมวลผลเมื่อพบเจอกับข้อมูลใหม่ๆ ในรูปแบบขั้นบันได'
    ],
    status: 'finalized'
  };
}
