import { ClientProfile, FingerprintItem, FingerKey } from '../types';
import { createEmptyFingerprintData } from './dermatoglyphics';
import { generateFingerprintSvg, generatePalmSvg } from './sampleImages';

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'client_mbt_001',
    user_id_code: 'MBT-2026-0001',
    status: 'analyst_reviewed',
    first_name: 'กิตติศักดิ์',
    last_name: 'เจริญสุขโชคดี',
    nick_name: 'น็อต',
    phone: '089-123-4567',
    email: 'kittisak.not@gmail.com',
    citizen_id: '1-1002-00345-67-8',
    parent_name: 'นายสมบัติ เจริญสุขโชคดี',
    parent_phone: '081-987-6543',
    parent_relationship: 'บิดา',
    remark: 'สนใจค้นหาแนวทางการเลือกแผนการเรียน ม.ปลาย และความถนัดด้านวิศวกรรม/เทคโนโลยี',
    birth_date: '2010-05-14',
    gender: 'male',
    line_id: '@nott_kitti',
    address: '128/45 ถนนสุขุมวิท 71 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพฯ 10110',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    assigned_collector: 'สมชาย นักเก็บลายมือ',
    assigned_analyst: 'ดร.วิภา ผู้เชี่ยวชาญลายผิว',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    latest_modified: new Date(Date.now() - 3600000 * 2).toISOString(),
    palm_scans: {
      left_palm: {
        image: generatePalmSvg('left', 36.5),
        atd_angle: 36.5
      },
      right_palm: {
        image: generatePalmSvg('right', 35.8),
        atd_angle: 35.8
      }
    }
  },
  {
    id: 'client_mbt_002',
    user_id_code: 'MBT-2026-0002',
    status: 'ai_resulted',
    first_name: 'พิมพ์ชนก',
    last_name: 'ศิริรัตนกุล',
    nick_name: 'ใบเฟิร์น',
    phone: '095-882-3411',
    email: 'pimchanok.fern@gmail.com',
    citizen_id: '3-1004-99882-12-3',
    parent_name: 'นางวราภรณ์ ศิริรัตนกุล',
    parent_phone: '086-554-1234',
    parent_relationship: 'มารดา',
    remark: 'ต้องการประเมินความถนัดด้านภาษาและศิลปกรรมศาสตร์ สแกนครบ 10 นิ้วเรียบร้อย',
    birth_date: '2012-09-22',
    gender: 'female',
    line_id: '@baifern_siri',
    address: '55/12 หมู่บ้านลัดดารมย์ ถนนราชพฤกษ์ ต.บางกร่าง อ.เมือง นนทบุรี 11000',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    assigned_collector: 'สมชาย นักเก็บลายมือ',
    assigned_analyst: 'ดร.วิภา ผู้เชี่ยวชาญลายผิว',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    latest_modified: new Date(Date.now() - 3600000 * 5).toISOString(),
    palm_scans: {
      left_palm: {
        image: generatePalmSvg('left', 38.2),
        atd_angle: 38.2
      },
      right_palm: {
        image: generatePalmSvg('right', 37.9),
        atd_angle: 37.9
      }
    }
  },
  {
    id: 'client_mbt_003',
    user_id_code: 'MBT-2026-0003',
    status: 'ready_to_review',
    first_name: 'ธนวัฒน์',
    last_name: 'ปรีชาบริบูรณ์',
    nick_name: 'วิน',
    phone: '082-345-6789',
    email: 'thanawat.win@hotmail.com',
    citizen_id: '1-1005-44321-90-1',
    parent_name: 'นายเกรียงไกร ปรีชาบริบูรณ์',
    parent_phone: '089-445-5667',
    parent_relationship: 'บิดา',
    remark: 'สแกนครบ 10 นิ้ว พร้อมภาพถ่ายมุม 1-7 รอผู้ตรวจทานยืนยันความคมชัด',
    birth_date: '2015-11-03',
    gender: 'male',
    line_id: '@win_thanawat',
    address: '88/9 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
    profile_image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    assigned_collector: 'สมชาย นักเก็บลายมือ',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    latest_modified: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'client_mbt_004',
    user_id_code: 'MBT-2026-0004',
    status: 'reported',
    first_name: 'กัญญารัตน์',
    last_name: 'พัชรพิมล',
    nick_name: 'แพรว',
    phone: '061-998-7654',
    email: 'kanyarat.praew@gmail.com',
    citizen_id: '2-1008-77665-43-2',
    parent_name: 'นางนฤมล พัชรพิมล',
    parent_phone: '081-234-5678',
    parent_relationship: 'มารดา',
    remark: 'ออกรายงาน Mind Booster Report เรียบร้อยแล้ว พร้อมส่งมอบผลการวิเคราะห์ให้ผู้ปกครอง',
    birth_date: '2008-03-18',
    gender: 'female',
    line_id: '@praew_kp',
    address: '34/2 ซอยอารีย์สัมพันธ์ 1 ถนนพหลโยธิน แขวงพญาไท กรุงเทพฯ 10400',
    profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    assigned_collector: 'สมชาย นักเก็บลายมือ',
    assigned_analyst: 'ดร.วิภา ผู้เชี่ยวชาญลายผิว',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    latest_modified: new Date(Date.now() - 86400000 * 1).toISOString(),
    palm_scans: {
      left_palm: {
        image: generatePalmSvg('left', 34.9),
        atd_angle: 34.9
      },
      right_palm: {
        image: generatePalmSvg('right', 35.1),
        atd_angle: 35.1
      }
    }
  },
  {
    id: 'client_mbt_005',
    user_id_code: 'MBT-2026-0005',
    status: 'created',
    first_name: 'อภิชาต',
    last_name: 'ตั้งจิตมั่นคง',
    nick_name: 'ภูมิ',
    phone: '084-556-7788',
    email: 'apichart.p@gmail.com',
    citizen_id: '1-1009-88776-55-4',
    parent_name: 'นายประเสริฐ ตั้งจิตมั่นคง',
    parent_phone: '081-332-1199',
    parent_relationship: 'บิดา',
    remark: 'ลงทะเบียนใหม่ รอเข้ารับการสแกนลายนิ้วมือ 10 นิ้วที่ศูนย์',
    birth_date: '2016-08-09',
    gender: 'male',
    line_id: '@poom_apichart',
    address: '99/101 ถนนพระราม 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพฯ 10150',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    latest_modified: new Date().toISOString()
  }
];

export function generateSampleFingerprintData(clientId: string): Record<FingerKey, FingerprintItem> {
  const base = createEmptyFingerprintData();
  
  const samplePatterns: Record<FingerKey, { pattern: string; rc1: number; rc2: number }> = {
    R1: { pattern: 'WC', rc1: 16, rc2: 14 },
    R2: { pattern: 'WI', rc1: 17, rc2: 15 },
    R3: { pattern: 'UL', rc1: 14, rc2: 0 },
    R4: { pattern: 'WC', rc1: 15, rc2: 13 },
    R5: { pattern: 'UL', rc1: 16, rc2: 0 },
    L1: { pattern: 'WC', rc1: 15, rc2: 13 },
    L2: { pattern: 'WD', rc1: 18, rc2: 16 },
    L3: { pattern: 'UL', rc1: 13, rc2: 0 },
    L4: { pattern: 'WS', rc1: 16, rc2: 14 },
    L5: { pattern: 'WC', rc1: 17, rc2: 15 },
  };

  Object.keys(samplePatterns).forEach((keyStr) => {
    const k = keyStr as FingerKey;
    const pat = samplePatterns[k];
    const finger = base[k];

    finger.ai_type = pat.pattern;
    finger.ai_RC1 = pat.rc1;
    finger.ai_RC2 = pat.rc2;
    finger.analyst_type = pat.pattern;
    finger.analyst_RC1 = pat.rc1;
    finger.analyst_RC2 = pat.rc2;
    finger.isComplete = true;

    // Angles 1 to 7
    finger.angles = {};
    for (let angle = 1; angle <= 7; angle++) {
      finger.angles[`angle_${angle}`] = {
        image: generateFingerprintSvg(pat.pattern, k, angle),
        ai_RC: pat.rc1,
        analyst_RC: pat.rc1,
        quality_score: 92 + (angle % 6),
        lines: [
          {
            start: { x: 50, y: 220 },
            end: { x: 150, y: 170 },
            type: 'delta-core'
          }
        ],
        plot_coordinates: [
          { x: 65, y: 210, order: 1 },
          { x: 80, y: 200, order: 2 },
          { x: 95, y: 190, order: 3 },
          { x: 110, y: 180, order: 4 },
          { x: 125, y: 175, order: 5 },
          { x: 140, y: 170, order: 6 }
        ]
      };
    }
  });

  return base;
}
