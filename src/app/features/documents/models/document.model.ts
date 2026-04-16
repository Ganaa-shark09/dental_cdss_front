export interface DocumentRecord {
  uuid?: string;
  id?: string;

  patient_id?: string;
  patient_name?: string;

  consultation_id?: string;
  consultation_display?: string;

  clinic_id?: string;
  clinic_name?: string;

  title?: string;
  document_type?: string;
  description?: string;
  consultation_number?: string;
  consultation?: string;

  document?: string;
  file_url?: string;
  original_filename?: string;

  uploaded_at?: string;
  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface DocumentListResponse {
  count?: number;
  results?: DocumentRecord[];
}
