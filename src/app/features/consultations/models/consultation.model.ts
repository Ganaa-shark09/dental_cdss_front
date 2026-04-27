export interface Consultation {
  uuid: string;

  patient?: string;
  patient_name?: string;

  clinic?: string;
  clinic_name?: string;

  staff?: string;
  staff_name?: string;

  appointment?: string;
  appointment_date?: string;

  consultation_date?: string;
  consultation_time?: string;
  consultation_number?: string;
  visit_number?: string;
  opd_number?: string;

  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;

  // Structured wizard fields
  systemic_conditions?: string[];
  habits?: string[];
  allergies?: string[];
  past_dental_history?: string[];
  complaint_duration?: string;
  complaint_severity?: string;
  current_medications?: string;
  family_history?: string;

  status?: string;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface ToothComplaintCode {
  code: string;
  complaint: string;
  department: string;
}

export interface ToothComplaint {
  uuid: string;
  consultation: string;
  tooth_number: string;
  complaint_codes: ToothComplaintCode[];
  duration: string;
  severity: string;
}

export interface ToothComplaintBulkPayload {
  teeth: Array<{
    tooth_number: string;
    complaint_codes: ToothComplaintCode[];
    duration: string;
    severity: string;
  }>;
}

export interface ConsultationListResponse {
  count?: number;
  results?: Consultation[];
}
