export interface Clinic {
  phone: string;
  uuid: string;
  name: string;
  code?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClinicListResponse {
  count?: number;
  results?: Clinic[];
}
