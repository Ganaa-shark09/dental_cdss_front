import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';

export interface DashboardTotals {
  patients: number;
  appointments: number;
  consultations: number;
  users: number;
}

export interface DashboardMetric {
  key: string;
  label: string;
  value: number;
  caption: string;
  icon: string;
  route: string;
}

export interface WeeklyAppointment {
  day: string;
  date: string;
  count: number;
}

export interface AppointmentStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface ClinicalSnapshot {
  total_records: number;
  completion_rate: number;
  last_updated: string;
}

export interface DashboardQuickLink {
  label: string;
  caption: string;
  icon: string;
  route: string;
}

export interface DashboardActivity {
  model: string;
  field: string;
  old: string | null;
  new: string | null;
  user: string;
  timestamp: string;
}

export interface DashboardSummary {
  totals: DashboardTotals;
  metrics: DashboardMetric[];
  appointments_this_week: WeeklyAppointment[];
  appointment_status_breakdown: AppointmentStatusBreakdown[];
  clinical_snapshot: ClinicalSnapshot;
  quick_links: DashboardQuickLink[];
  recent_activities: DashboardActivity[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly api = inject(ApiService);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  fetchSummary(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.error.set(null);

    this.api
      .get<DashboardSummary>('common/dashboard/summary/')
      .pipe(
        finalize(() => {
          if (showLoader) {
            this.loading.set(false);
          }
        }),
      )
      .subscribe({
        next: (data) => {
          this.summary.set(data);
        },
        error: () => {
          this.error.set('Unable to load dashboard summary.');

          if (showLoader) {
            this.summary.set(null);
          }
        },
      });
  }
}
