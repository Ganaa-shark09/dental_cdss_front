import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuditLogRecord } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class AuditLogsService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'audit-logs/';

  getLogs(params?: {
    model_name?: string;
    record_id?: string;
    field_name?: string;
    user_id?: string;
  }): Observable<AuditLogRecord[]> {
    return this.api.get<AuditLogRecord[]>(this.endpoint, params);
  }

  getLog(uuid: string): Observable<AuditLogRecord> {
    return this.api.get<AuditLogRecord>(`${this.endpoint}${uuid}/`);
  }
}
