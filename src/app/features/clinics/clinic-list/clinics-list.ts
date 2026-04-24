import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { ClinicsService } from '../services/clinics.service';
import { Clinic } from '../models/clinic.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';
import { CdssDeleteButton } from '../../../shared/components/buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-clinics-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton, CdssDeleteButton],
  providers: [ConfirmationService],
  templateUrl: './clinics-list.html',
  styleUrl: './clinics-list.scss',
})
export class ClinicsList {
  private readonly clinicsService = inject(ClinicsService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  clinics = signal<Clinic[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  page = signal(1);
  pageSize = signal(10);
  ordering = signal('');

  tableConfig = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'name', header: 'Clinic Name', type: 'text', sortable: true },
      { field: 'code', header: 'Code', type: 'text', sortable: true },
      { field: 'email', header: 'Email', type: 'text', sortable: true },
      { field: 'phone_number', header: 'Phone', type: 'text' },
      { field: 'city', header: 'City', type: 'text', sortable: true },
      {
        field: 'is_active',
        header: 'Status',
        type: 'tag',
        customFormat: (value: boolean) => (value ? 'Active' : 'Inactive'),
        tagSeverityFn: (value: boolean) => (value ? 'success' : 'danger'),
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
    this.loadClinics();
  }

  loadClinics(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.clinicsService
      .getClinics({
        page: this.page(),
        page_size: this.pageSize(),
        ordering: this.ordering() || undefined,
      })
      .subscribe({
        next: (response) => {
          const clinics = Array.isArray(response) ? response : (response.results ?? []);

          const total = Array.isArray(response)
            ? response.length
            : (response.count ?? clinics.length);

          this.clinics.set(clinics);
          this.totalRecords.set(total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Load failed',
            detail: 'Unable to load clinics.',
          });
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.page.set((event.first ?? 0) / (event.rows ?? 10) + 1);
    this.pageSize.set(event.rows ?? 10);
    this.ordering.set((event as any).ordering || '');
    this.loadClinics(false);
  }

  createClinic(): void {
    this.router.navigate(['/clinics/new']);
  }

  onViewClinic(clinic: Clinic): void {
    this.router.navigate(['/clinics', clinic.uuid]);
  }

  onEditClinic(clinic: Clinic): void {
    this.router.navigate(['/clinics', clinic.uuid, 'edit']);
  }

  deleteClinic(clinic: Clinic): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${clinic.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.clinicsService.deleteClinic(clinic.uuid).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Clinic deleted successfully.',
            });
            this.loadClinics(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete clinic.',
            });
          },
        });
      },
    });
  }
}
