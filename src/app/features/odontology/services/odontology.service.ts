import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  DentalChart,
  DentalChartPayload,
  ToothRecord,
  ToothRecordPayload,
} from '../models/odontology.model';

@Injectable({
  providedIn: 'root',
})
export class OdontologyService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'odontology/';

  getCharts(): Observable<DentalChart[]> {
    return this.api.get<DentalChart[]>(this.endpoint);
  }

  getChart(uuid: string): Observable<DentalChart> {
    return this.api.get<DentalChart>(`${this.endpoint}${uuid}/`);
  }

  createChart(payload: DentalChartPayload): Observable<DentalChart> {
    return this.api.post<DentalChart>(this.endpoint, payload);
  }

  updateChart(uuid: string, payload: Partial<DentalChartPayload>): Observable<DentalChart> {
    return this.api.put<DentalChart>(`${this.endpoint}${uuid}/`, payload);
  }

  getToothRecords(chartUuid: string): Observable<ToothRecord[]> {
    return this.api.get<ToothRecord[]>(`${this.endpoint}${chartUuid}/tooth-records/`);
  }

  getToothRecord(chartUuid: string, toothRecordUuid: string): Observable<ToothRecord> {
    return this.api.get<ToothRecord>(
      `${this.endpoint}${chartUuid}/tooth-records/${toothRecordUuid}/`,
    );
  }

  createToothRecord(chartUuid: string, payload: ToothRecordPayload): Observable<ToothRecord> {
    return this.api.post<ToothRecord>(`${this.endpoint}${chartUuid}/tooth-records/`, payload);
  }

  updateToothRecord(
    chartUuid: string,
    toothRecordUuid: string,
    payload: Partial<ToothRecordPayload>,
  ): Observable<ToothRecord> {
    return this.api.put<ToothRecord>(
      `${this.endpoint}${chartUuid}/tooth-records/${toothRecordUuid}/`,
      payload,
    );
  }
}
