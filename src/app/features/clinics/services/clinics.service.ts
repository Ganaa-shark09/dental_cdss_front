import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Clinic, ClinicListResponse } from '../models/clinic.model';

export interface ClinicsQueryParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface ClinicPayload {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
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
export class ClinicsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'clinics/';

  getClinics(params?: ClinicsQueryParams): Observable<Clinic[] | ClinicListResponse> {
    return this.api.get<Clinic[] | ClinicListResponse>(
      this.endpoint,
      params as Record<string, string | number | boolean>,
    );
  }

  getClinic(uuid: string): Observable<Clinic> {
    return this.api.get<Clinic>(`${this.endpoint}${uuid}/`);
  }

  createClinic(payload: ClinicPayload): Observable<Clinic> {
    return this.api.post<Clinic>(this.endpoint, payload);
  }

  updateClinic(uuid: string, payload: ClinicPayload): Observable<Clinic> {
    return this.api.put<Clinic>(`${this.endpoint}${uuid}/`, payload);
  }

  deleteClinic(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
