import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DocumentListResponse, DocumentRecord } from '../models/document.model';

export interface DocumentPayload {
  patient_id?: string;
  consultation_id?: string;
  clinic_id?: string;
  title: string;
  document_type: string;
  description?: string;
  document?: File | null;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'documents/';

  getDocuments(): Observable<DocumentRecord[] | DocumentListResponse> {
    return this.api.get<DocumentRecord[] | DocumentListResponse>(this.endpoint);
  }

  getDocument(uuid: string): Observable<DocumentRecord> {
    return this.api.get<DocumentRecord>(`${this.endpoint}${uuid}/`);
  }

  createDocument(payload: DocumentPayload): Observable<DocumentRecord> {
    return this.api.postFormData<DocumentRecord>(this.endpoint, this.buildFormData(payload));
  }

  updateDocument(uuid: string, payload: DocumentPayload): Observable<DocumentRecord> {
    return this.api.putFormData<DocumentRecord>(
      `${this.endpoint}${uuid}/`,
      this.buildFormData(payload),
    );
  }

  deleteDocument(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }

  private buildFormData(payload: DocumentPayload): FormData {
    const formData = new FormData();

    if (payload.patient_id) formData.append('patient_id', payload.patient_id);
    if (payload.consultation_id) formData.append('consultation_id', payload.consultation_id);
    if (payload.clinic_id) formData.append('clinic_id', payload.clinic_id);

    formData.append('title', payload.title);
    formData.append('document_type', payload.document_type);

    if (payload.description) formData.append('description', payload.description);
    if (payload.document) formData.append('document', payload.document);
    if (payload.is_active !== undefined) {
      formData.append('is_active', String(payload.is_active));
    }

    return formData;
  }
}
