export interface Staff {
  uuid: string;
  employee_id?: string;
  user_name?: string;
  user_email?: string;
  years_of_experience?: string;
  role?: string;
  designation?: string;
  specialization?: string;
  clinic?: string;
  clinic_name?: string;
  user?: string;
  user_display?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffListResponse {
  count?: number;
  results?: Staff[];
}
