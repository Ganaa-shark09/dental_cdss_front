export interface Prescription {
  uuid: string;

  patient_id?: string;
  patient_name?: string;

  staff_id?: string;
  staff_name?: string;

  consultation_id?: string;
  consultation_display?: string;
  consultation_number?: string;

  date_issued?: string;

  medication?: string;
  dosage?: string;
  expiry_date?: string;
  frequency?: string;
  duration?: string;
  treatment_instructions?: string;
  notes?: string;

  status?: string;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface PrescriptionListResponse {
  count?: number;
  results?: Prescription[];
}
