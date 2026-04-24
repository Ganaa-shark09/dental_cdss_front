import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Prescription, PrescriptionListResponse } from '../models/prescription.model';

export interface PrescriptionPayload {
  patient_id: string;
  staff_id: string;
  consultation_id?: string;

  date_issued: string;

  medication: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  treatment_instructions: string;
  notes?: string;

  status: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PrescriptionsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'prescriptions/';

  getPrescriptions(): Observable<Prescription[] | PrescriptionListResponse> {
    return this.api.get<Prescription[] | PrescriptionListResponse>(this.endpoint);
  }

  getPrescription(uuid: string): Observable<Prescription> {
    return this.api.get<Prescription>(`${this.endpoint}${uuid}/`);
  }

  createPrescription(payload: PrescriptionPayload): Observable<Prescription> {
    return this.api.post<Prescription>(this.endpoint, payload);
  }

  updatePrescription(uuid: string, payload: PrescriptionPayload): Observable<Prescription> {
    return this.api.put<Prescription>(`${this.endpoint}${uuid}/`, payload);
  }

  deletePrescription(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
