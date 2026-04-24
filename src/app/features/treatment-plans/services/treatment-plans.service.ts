import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { TreatmentPlan, TreatmentPlanListResponse } from '../models/treatment-plan.model';

export interface TreatmentPlanPayload {
  patient_id: string;
  staff_id: string;
  consultation_id?: string;

  plan_date: string;
  title: string;
  treatment_type: string;
  treatment_description: string;

  summary?: string;
  procedures?: string;
  estimated_duration?: string;
  cost_estimate?: number | string;
  instructions?: string;
  notes?: string;

  status: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TreatmentPlansService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'treatment-plans/';

  getTreatmentPlans(): Observable<TreatmentPlan[] | TreatmentPlanListResponse> {
    return this.api.get<TreatmentPlan[] | TreatmentPlanListResponse>(this.endpoint);
  }

  getTreatmentPlan(uuid: string): Observable<TreatmentPlan> {
    return this.api.get<TreatmentPlan>(`${this.endpoint}${uuid}/`);
  }

  createTreatmentPlan(payload: TreatmentPlanPayload): Observable<TreatmentPlan> {
    return this.api.post<TreatmentPlan>(this.endpoint, payload);
  }

  updateTreatmentPlan(uuid: string, payload: TreatmentPlanPayload): Observable<TreatmentPlan> {
    return this.api.put<TreatmentPlan>(`${this.endpoint}${uuid}/`, payload);
  }

  deleteTreatmentPlan(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}${uuid}/`);
  }
}
