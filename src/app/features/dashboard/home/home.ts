import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../services/dashboard.service';

type TrackableDashboardItem = {
  key?: string;
  label?: string;
  route?: string;
};

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private refreshTimer?: ReturnType<typeof setInterval>;

  summary = this.dashboardService.summary;
  loading = this.dashboardService.loading;
  error = this.dashboardService.error;

  today = new Date();

  maxWeeklyAppointments = computed(() => {
    const weeklyData = this.summary()?.appointments_this_week ?? [];
    const counts = weeklyData.map((item) => item.count);

    return Math.max(...counts, 1);
  });

  completionRate = computed(() => {
    return this.summary()?.clinical_snapshot?.completion_rate ?? 0;
  });

  ngOnInit(): void {
    this.dashboardService.fetchSummary(true);

    this.refreshTimer = setInterval(() => {
      this.dashboardService.fetchSummary(false);
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  getBarHeight(count: number): string {
    if (!count) {
      return '4%';
    }

    const percentage = Math.round((count / this.maxWeeklyAppointments()) * 100);

    return `${Math.max(8, percentage)}%`;
  }

  getActivityIcon(model: string | null | undefined): string {
    const type = (model ?? '').toLowerCase();

    if (type.includes('patient')) return 'pi pi-users';
    if (type.includes('appointment')) return 'pi pi-calendar';
    if (type.includes('consultation')) return 'pi pi-comments';
    if (type.includes('cdss')) return 'pi pi-bolt';
    if (type.includes('user')) return 'pi pi-user';

    return 'pi pi-circle';
  }

  trackByDashboardItem(index: number, item: TrackableDashboardItem): string {
    return item.key ?? item.route ?? item.label ?? String(index);
  }

  trackByWeeklyDate(index: number, item: { date?: string }): string {
    return item.date ?? String(index);
  }

  trackByActivity(index: number, item: { timestamp?: string; field?: string }): string {
    return `${item.timestamp ?? index}-${item.field ?? ''}`;
  }
}
