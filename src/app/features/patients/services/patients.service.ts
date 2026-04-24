import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Patient, PatientListResponse } from '../models/patient.model';

export interface PatientsQueryParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface PatientPayload {
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
}

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'patients/';

  getPatients(params?: PatientsQueryParams): Observable<Patient[] | PatientListResponse> {
    return this.api.get<Patient[] | PatientListResponse>(
      this.endpoint,
      params as Record<string, string | number | boolean>,
    );
  }

  getPatient(uuid: string): Observable<Patient> {
    return this.api.get<Patient>(`${this.endpoint}${uuid}/`);
  }

  createPatient(payload: PatientPayload): Observable<Patient> {
    return this.api.post<Patient>(this.endpoint, payload);
  }

  updatePatient(uuid: string, payload: PatientPayload): Observable<Patient> {
    return this.api.put<Patient>(`${this.endpoint}${uuid}/`, payload);
  }

  deletePatient(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
