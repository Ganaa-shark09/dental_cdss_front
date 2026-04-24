export interface ToothRecord {
  uuid: string;
  chart: string;
  tooth_number: string;
  condition: string;
  surfaces: string[];
  mobility_grade?: string | null;
  percussion_tenderness: boolean;
  palpation_tenderness: boolean;
  probing_depth_summary?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DentalChart {
  uuid: string;
  consultation: string;
  consultation_number: string;
  notes?: string | null;
  is_active: boolean;
  tooth_records: ToothRecord[];
  created_at?: string;
  updated_at?: string;
}

export interface DentalChartPayload {
  consultation_id: string;
  notes?: string;
  is_active?: boolean;
}

export interface ToothRecordPayload {
  tooth_number: string;
  condition: string;
  surfaces?: string[];
  mobility_grade?: string;
  percussion_tenderness?: boolean;
  palpation_tenderness?: boolean;
  probing_depth_summary?: string;
  notes?: string;
  is_active?: boolean;
}
