import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Appointment, AppointmentListResponse } from '../models/appointment.model';

export interface AppointmentsQueryParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface AppointmentPayload {
  patient_id: string;
  staff_id: string;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason?: string;
  notes?: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'appointments/';

  getAppointments(
    params?: AppointmentsQueryParams,
  ): Observable<Appointment[] | AppointmentListResponse> {
    return this.api.get<Appointment[] | AppointmentListResponse>(
      this.endpoint,
      params as Record<string, string | number | boolean>,
    );
  }

  getAppointment(uuid: string): Observable<Appointment> {
    return this.api.get<Appointment>(`${this.endpoint}${uuid}/`);
  }

  createAppointment(payload: AppointmentPayload): Observable<Appointment> {
    return this.api.post<Appointment>(this.endpoint, payload);
  }

  updateAppointment(uuid: string, payload: AppointmentPayload): Observable<Appointment> {
    return this.api.put<Appointment>(`${this.endpoint}${uuid}/`, payload);
  }

  deleteAppointment(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
