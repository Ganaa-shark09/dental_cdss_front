import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  Consultation,
  ConsultationListResponse,
  ToothComplaint,
  ToothComplaintBulkPayload,
} from '../models/consultation.model';

export interface ConsultationPayload {
  patient_id: string;
  staff_id?: string;
  clinic_id: string;
  appointment_id?: string;

  consultation_date: string;
  consultation_time?: string;
  visit_number?: string;
  opd_number?: string;

  chief_complaint?: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;

  // Wizard structured fields
  systemic_conditions?: string[];
  habits?: string[];
  allergies?: string[];
  past_dental_history?: string[];
  complaint_duration?: string;
  complaint_severity?: string;

  status?: string;
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

  patchConsultation(uuid: string, payload: Partial<ConsultationPayload>): Observable<Consultation> {
    return this.api.patch(`${this.endpoint}${uuid}/`, payload);
  }

  deleteConsultation(uuid: string): Observable<void> {
    return this.api.delete(`${this.endpoint}${uuid}/`);
  }

  // Tooth complaints
  getToothComplaints(consultationUuid: string): Observable<ToothComplaint[]> {
    return this.api.get<ToothComplaint[]>(`${this.endpoint}${consultationUuid}/tooth-complaints/`);
  }

  createToothComplaintBulk(
    consultationUuid: string,
    payload: ToothComplaintBulkPayload,
  ): Observable<ToothComplaint[]> {
    return this.api.post<ToothComplaint[]>(
      `${this.endpoint}${consultationUuid}/tooth-complaints/bulk/`,
      payload,
    );
  }
}
