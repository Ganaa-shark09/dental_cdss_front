import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  CdssEngine,
  CdssEngineUpdatePayload,
  CdssRecommendationRow,
} from '../models/cdss-engine.model';

@Injectable({
  providedIn: 'root',
})
export class CdssService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'cdss/';

  getCdssEngines(): Observable<CdssEngine[]> {
    return this.api.get<CdssEngine[]>(this.endpoint);
  }

  getCdssEngine(uuid: string): Observable<CdssEngine> {
    return this.api.get<CdssEngine>(`${this.endpoint}${uuid}/`);
  }

  analyzeConsultation(payload: { consultation_id: string }): Observable<CdssEngine> {
    return this.api.post<CdssEngine>(this.endpoint, payload);
  }

  updateCdssEngine(uuid: string, payload: CdssEngineUpdatePayload): Observable<CdssEngine> {
    return this.api.put<CdssEngine>(`${this.endpoint}${uuid}/`, payload);
  }

  patchCdssEngine(uuid: string, payload: CdssEngineUpdatePayload): Observable<CdssEngine> {
    return this.api.patch<CdssEngine>(`${this.endpoint}${uuid}/`, payload);
  }

  getCdssRecommendations(cdssEngineUuid: string): Observable<CdssRecommendationRow[]> {
    return this.api.get<CdssRecommendationRow[]>(
      `${this.endpoint}${cdssEngineUuid}/recommendations/`,
    );
  }
}
