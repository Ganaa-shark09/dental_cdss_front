import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Consultation, ConsultationListResponse } from '../models/consultation.model';

export interface ConsultationPayload {
  patient_id: string;
  staff_id: string;
  clinic_id: string;
  appointment_id?: string;

  consultation_date: string;
  consultation_time: string;

  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;

  status: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultationsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'consultations/';

  getConsultations(): Observable<Consultation[] | ConsultationListResponse> {
    return this.api.get(this.endpoint);
  }

  getConsultation(uuid: string): Observable<Consultation> {
    return this.api.get(`${this.endpoint}${uuid}/`);
  }

  createConsultation(payload: ConsultationPayload): Observable<Consultation> {
    return this.api.post(this.endpoint, payload);
  }

  updateConsultation(uuid: string, payload: ConsultationPayload): Observable<Consultation> {
    return this.api.put(`${this.endpoint}${uuid}/`, payload);
  }

  deleteConsultation(uuid: string): Observable<void> {
    return this.api.delete(`${this.endpoint}${uuid}/`);
  }
}
