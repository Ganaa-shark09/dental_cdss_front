import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { TreatmentPlansService } from '../services/treatment-plans.service';
import { TreatmentPlan } from '../models/treatment-plan.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';
import { CdssDeleteButton } from '../../../shared/components/buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-treatment-plans-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton, CdssDeleteButton],
  providers: [ConfirmationService],
  templateUrl: './treatment-plans-list.html',
  styleUrl: './treatment-plans-list.scss',
})
export class TreatmentPlansList {
  private readonly service = inject(TreatmentPlansService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  data = signal<TreatmentPlan[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  config = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'treatment_type', header: 'Treatment Type', type: 'text', sortable: true },
      { field: 'consultation_number', header: 'Consultation Number', type: 'text', sortable: true },
      { field: 'start_date', header: 'Start Date', type: 'text', sortable: true },
      { field: 'created_at', header: 'Created At', type: 'date', sortable: true },
      {
        field: 'status',
        header: 'Status',
        type: 'tag',
        customFormat: (value: string) => value || '—',
        tagSeverityFn: (value: string) => {
          switch (value) {
            case 'approved':
              return 'success';
            case 'draft':
              return 'warn';
            case 'cancelled':
              return 'danger';
            default:
              return 'secondary';
          }
        },
        sortable: true,
      },
    ],
    dataKey: 'uuid',
    showViewButton: true,
    showEditButton: true,
    showDeleteButton: false,
    enableSelection: false,
    lazy: true,
  }));

  constructor() {
    this.loadTreatmentPlans();
  }

  loadTreatmentPlans(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.service.getTreatmentPlans().subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : (response.results ?? []);
        const total = Array.isArray(response) ? response.length : (response.count ?? items.length);

        this.data.set(items);
        this.totalRecords.set(total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load treatment plans.',
        });
      },
    });
  }

  onLazyLoad(_: TableLazyLoadEvent): void {
    this.loadTreatmentPlans(false);
  }

  createTreatmentPlan(): void {
    this.router.navigate(['/treatment-plans/new']);
  }

  onViewTreatmentPlan(item: TreatmentPlan): void {
    if (!item.uuid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Navigation failed',
        detail: 'Treatment plan ID is missing.',
      });
      return;
    }

    this.router.navigate(['/treatment-plans', item.uuid]);
  }

  onEditTreatmentPlan(item: TreatmentPlan): void {
    if (!item.uuid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Navigation failed',
        detail: 'Treatment plan ID is missing.',
      });
      return;
    }

    this.router.navigate(['/treatment-plans', item.uuid, 'edit']);
  }

  deleteTreatmentPlan(item: TreatmentPlan): void {
    if (!item.uuid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Delete failed',
        detail: 'Treatment plan ID is missing.',
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this treatment plan?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.service.deleteTreatmentPlan(item.uuid).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Treatment plan deleted successfully.',
            });
            this.loadTreatmentPlans(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete treatment plan.',
            });
          },
        });
      },
    });
  }
}
