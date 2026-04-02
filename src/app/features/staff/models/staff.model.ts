export interface Staff {
  uuid: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
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
