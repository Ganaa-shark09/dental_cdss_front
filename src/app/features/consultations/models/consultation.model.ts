export interface Consultation {
  uuid: string;

  patient?: string;
  patient_name?: string;

  staff?: string;
  staff_name?: string;

  appointment?: string;
  appointment_date?: string;

  consultation_date?: string;
  consultation_number?: string;

  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;

  status?: string;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface ConsultationListResponse {
  count?: number;
  results?: Consultation[];
}
