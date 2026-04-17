export interface TreatmentPlan {
  uuid: string;

  patient_id?: string;
  patient_name?: string;

  staff_id?: string;
  staff_name?: string;

  consultation_id?: string;
  consultation?: string;
  consultation_number?: string;
  consultation_uuid?: string;
  consultation_display?: string;

  plan_date?: string;
  title?: string;
  treatment_type?: string;
  treatment_description?: string;

  summary?: string;
  procedures?: string;
  estimated_duration?: string;
  cost_estimate?: number | string;
  instructions?: string;
  notes?: string;

  status?: string;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface TreatmentPlanListResponse {
  count?: number;
  results?: TreatmentPlan[];
}
