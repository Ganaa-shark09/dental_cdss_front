export interface Patient {
  uuid: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PatientListResponse {
  count?: number;
  results?: Patient[];
}
