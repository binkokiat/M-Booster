export type OfficerRole = 'collector' | 'analyst' | 'reviewer' | 'manager' | 'admin';

export interface Officer {
  id: string;
  name: string;
  email: string;
  role: OfficerRole;
  avatarUrl?: string;
  department?: string;
  phone?: string;
}

export type ScanStatus = 
  | 'created'
  | 'ready_to_review'
  | 'approved'
  | 'disapproved'
  | 'ai_processing'
  | 'ai_resulted'
  | 'analyst_reviewed'
  | 'export_to_report'
  | 'reported';

export interface PlotPoint {
  x: number;
  y: number;
  order: number;
  label?: string;
}

export interface LineSegment {
  start: { x: number; y: number };
  end: { x: number; y: number };
  type?: 'delta-core' | 'atd-a' | 'atd-t' | 'atd-d';
}

export interface FingerAngleData {
  image: string;
  ai_RC?: number;
  analyst_RC?: number;
  ai_count_image?: string;
  ai_enhanced_image?: string;
  quality_score?: number; // 0 - 100%
  lines: LineSegment[];
  plot_coordinates: PlotPoint[];
  contrast?: number;
  brightness?: number;
  invert?: boolean;
  capturedAt?: string;
}

export type FingerKey = 
  | 'R1' | 'R2' | 'R3' | 'R4' | 'R5'
  | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface FingerprintItem {
  key: FingerKey;
  finger_name_th: string;
  finger_name_en: string;
  hand: 'right' | 'left';
  finger_type: 'thumb' | 'index' | 'middle' | 'ring' | 'little';
  ai_type: string; // e.g. "WC" (Target Whorl), "WD" (Double Loop), "UL" (Ulnar Loop), "RL" (Radial Loop), "WA" (Spiral Whorl), "WS", "WE", "AU" (Arch)
  ai_RC1: number;
  ai_RC2: number;
  analyst_type: string;
  analyst_RC1: number;
  analyst_RC2: number;
  angles: {
    [angleKey: string]: FingerAngleData; // angle_1, angle_2, angle_3, angle_4, angle_5, angle_6, angle_7, side_left, side_right
  };
  notes?: string;
  isComplete?: boolean;
}

export interface ClientProfile {
  id: string;
  user_id_code: string; // e.g. MBT-2026-0042
  status: ScanStatus;
  first_name: string;
  last_name: string;
  nick_name: string;
  phone: string;
  email: string;
  citizen_id: string;
  parent_name: string;
  parent_phone: string;
  parent_relationship?: string;
  remark: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  line_id: string;
  address: string;
  profile_image: string;
  report_id?: string;
  disapproved_reason?: string;
  assigned_collector?: string;
  assigned_analyst?: string;
  created_at: string;
  latest_modified: string;
  palm_scans?: {
    left_palm?: {
      image: string;
      atd_angle: number;
      a_point?: { x: number; y: number };
      t_point?: { x: number; y: number };
      d_point?: { x: number; y: number };
    };
    right_palm?: {
      image: string;
      atd_angle: number;
      a_point?: { x: number; y: number };
      t_point?: { x: number; y: number };
      d_point?: { x: number; y: number };
    };
  };
}

export interface BrainLobeAnalysis {
  lobe_name: string;
  lobe_name_th: string;
  finger_left: string;
  finger_right: string;
  left_functions: string[];
  right_functions: string[];
  left_score: number;
  right_score: number;
  left_pattern: string;
  right_pattern: string;
}

export interface MultipleIntelligenceScore {
  category: string;
  category_th: string;
  score: number;
  level: 'High' | 'Medium' | 'Potential';
  description: string;
  suggestedCareers: string[];
}

export interface MindBoosterAnalysisReport {
  id: string;
  client_id: string;
  client_name: string;
  generated_at: string;
  trc_score: number; // Total Ridge Count
  learning_potential: string;
  atd_left_angle: number;
  atd_right_angle: number;
  learning_speed_index: string; // "Agile / High Sensitivity (<35°)" | "Standard (35°-40°)" | "Methodical / Step-by-step (>40°)"
  brain_lobes: BrainLobeAnalysis[];
  multiple_intelligences: MultipleIntelligenceScore[];
  disc_profile: {
    dominant: number;
    influential: number;
    steady: number;
    compliant: number;
    primary_type: string;
    personality_summary: string;
  };
  learning_style: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    dominant_style: string;
    description: string;
  };
  recommendations: string[];
  officer_signature?: string;
  status: 'draft' | 'finalized';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  officer_id: string;
  officer_name: string;
  officer_role: OfficerRole;
  action_type: 'create' | 'scan' | 'edit' | 'ai_analyze' | 'review' | 'approve' | 'disapprove' | 'export';
  client_id: string;
  client_name: string;
  details: string;
}
