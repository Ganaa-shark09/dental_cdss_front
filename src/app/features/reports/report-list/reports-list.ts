import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { ReportsService } from '../services/reports.service';
import { ReportRecord } from '../models/report.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';
import { CdssDeleteButton } from '../../../shared/components/buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton, CdssDeleteButton],
  providers: [ConfirmationService],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsList {
  private readonly service = inject(ReportsService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  data = signal<ReportRecord[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  config = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'consultation_number', header: 'Consultation', type: 'text', sortable: true },
      { field: 'report_type', header: 'Report Type', type: 'text', sortable: true },
      {
        field: 'prescription_summary.medication',
        header: 'Prescription',
        type: 'text',
      },
      {
        field: 'treatment_plan_summary.treatment_type',
        header: 'Treatment Plan',
        type: 'text',
      },
      {
        field: 'is_active',
        header: 'Status',
        type: 'tag',
        customFormat: (value: boolean) => (value ? 'Active' : 'Inactive'),
        tagSeverityFn: (value: boolean) => (value ? 'success' : 'danger'),
      },
      { field: 'created_at', header: 'Created', type: 'text', sortable: true },
    ],
    dataKey: 'uuid',
    showViewButton: true,
    showEditButton: true,
    showDeleteButton: false,
    scrollHeight: 'clamp(320px, 55vh, 420px)',
  }));

  constructor() {
    this.load();
  }

  load(showLoader = true): void {
    if (showLoader) this.loading.set(true);

    this.service.getReports().subscribe({
      next: (items) => {
        this.data.set(items);
        this.totalRecords.set(items.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load reports.',
        });
      },
    });
  }

  onLazyLoad(_: TableLazyLoadEvent): void {
    this.load(false);
  }

  onCreate(): void {
    this.router.navigate(['/reports/new']);
  }

  onView(item: ReportRecord): void {
    if (!item.uuid) return;
    this.router.navigate(['/reports', item.uuid]);
  }

  onEdit(item: ReportRecord): void {
    if (!item.uuid) return;
    this.router.navigate(['/reports', item.uuid, 'edit']);
  }

  onDelete(item: ReportRecord): void {
    if (!item.uuid) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this report?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.service.deleteReport(item.uuid).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Report deleted successfully.',
            });
            this.load(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete report.',
            });
          },
        });
      },
    });
  }
}
