export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  note?: string;
}

export interface PerToothResult {
  diagnosis: string;
  reasoning?: {
    explanation: string;
    ranked: Array<{ diagnosis: string; score: number; confidence: string }>;
  };
  requirements?: string[];
  redFlags?: string[];
  treatment: string[];
  treatmentPhases?: Record<string, string[]>;
  medication: MedicationItem[];
  investigations?: string[];
  icd: string;
  confidence: string;
  riskModifiers?: string[];
  safetyWarnings?: string[];
  department?: string;
}

export interface CdssEngine {
  uuid: string;
  consultation: string;
  consultation_number: string;
  department?: string;
  department_display?: string;
  risk_score: string;
  alerts: string[];
  recommendations: string[];
  diagnosis_assistance?: string | null;
  icd_code?: string;
  confidence?: string;
  per_tooth_results?: Record<string, PerToothResult>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CdssRecommendationRow {
  uuid: string;
  cdss_engine: string;
  consultation: string;
  consultation_number: string;
  recommendation: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CdssEngineUpdatePayload {
  risk_score?: string;
  alerts?: string[];
  recommendations?: string[];
  diagnosis_assistance?: string;
  is_active?: boolean;
}

export interface CdssEnginePrintData {
  uuid: string;
  consultation_number: string;
  consultation_date?: string;
  created_at?: string;
  department?: string;
  department_display?: string;
  risk_score?: string;
  chief_complaint?: string;
  provisional_diagnosis?: string;
  final_diagnosis?: string;
  diagnosis_assistance?: string;
  examination_summary?: string;
  alerts?: string[];
  recommendations?: string[];
  /* Flat patient fields */
  patient_name?: string;
  patient_code?: string;
  patient_gender?: string;
  patient_date_of_birth?: string;
  patient_phone?: string;
  /* Flat clinic fields */
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  /* Flat doctor fields */
  doctor_name?: string;
  doctor_designation?: string;
  doctor_license_number?: string;
  /* Per-tooth analysis */
  per_tooth_results?: Record<string, PerToothResult>;
}
