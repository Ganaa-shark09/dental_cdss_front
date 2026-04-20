export interface CdssEngine {
  uuid: string;
  consultation: string;
  consultation_number: string;
  risk_score: string;
  alerts: string[];
  recommendations: string[];
  diagnosis_assistance?: string | null;
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
