export interface Appointment {
  uuid: string;
  patient_id?: string;
  patient_name?: string;
  staff_id?: string;
  appointment_time?: string;
  appointment_number?: string;
  staff_name?: string;
  clinic_id?: string;
  clinic_name?: string;
  appointment_date?: string;
  status?: string;
  reason_for_visit?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentListResponse {
  count?: number;
  results?: Appointment[];
}
