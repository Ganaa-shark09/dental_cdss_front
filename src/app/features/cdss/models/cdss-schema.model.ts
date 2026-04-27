export interface ComplaintCode {
  code: string;
  label: string;
}

export interface ExamField {
  key: string;
  label: string;
  type: 'select' | 'boolean' | 'number' | 'text';
  options?: string[];
}

export interface CdssSchemaSection1 {
  systemic_conditions: string[];
  habits: string[];
  allergies: string[];
  past_dental_history: string[];
  severity_options: string[];
  duration_options: string[];
}

export interface CdssSchema {
  section1_medical_history: CdssSchemaSection1;
  section2_complaints: Record<string, ComplaintCode[]>;
  section3_examination: Record<string, ExamField[]>;
}
