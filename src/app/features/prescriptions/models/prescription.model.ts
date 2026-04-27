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

export interface PrescriptionPrintData {
  uuid: string;
  consultation_number?: string;
  consultation_date?: string;
  date_issued?: string;
  patient: {
    uuid: string;
    full_name: string;
    code?: string;
    gender?: string;
    date_of_birth?: string;
    phone?: string;
  };
  clinic: {
    uuid: string;
    name: string;
    address?: string;
    phone?: string;
  };
  doctor: {
    uuid: string;
    name: string;
    designation?: string;
    license_number?: string;
  };
  chief_complaint?: string;
  provisional_diagnosis?: string;
  final_diagnosis?: string;
  medication?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  treatment_instructions?: string;
  notes?: string;
}

export interface PrescriptionListResponse {
  count?: number;
  results?: Prescription[];
}
