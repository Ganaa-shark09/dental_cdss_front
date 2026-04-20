import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ReportPayload, ReportRecord } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'reports/';

  getReports(): Observable<ReportRecord[]> {
    return this.api.get<ReportRecord[]>(this.endpoint);
  }

  getReport(uuid: string): Observable<ReportRecord> {
    return this.api.get<ReportRecord>(`${this.endpoint}${uuid}/`);
  }

  createReport(payload: ReportPayload): Observable<ReportRecord> {
    return this.api.post<ReportRecord>(this.endpoint, payload);
  }

  updateReport(uuid: string, payload: ReportPayload): Observable<ReportRecord> {
    return this.api.put<ReportRecord>(`${this.endpoint}${uuid}/`, payload);
  }

  patchReport(uuid: string, payload: Partial<ReportPayload>): Observable<ReportRecord> {
    return this.api.patch<ReportRecord>(`${this.endpoint}${uuid}/`, payload);
  }

  deleteReport(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
