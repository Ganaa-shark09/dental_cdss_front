import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { PrescriptionsService } from '../services/prescriptions.service';
import { Prescription } from '../models/prescription.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';
import { CdssDeleteButton } from '../../../shared/components/buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-prescriptions-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton, CdssDeleteButton],
  providers: [ConfirmationService],
  templateUrl: './prescriptions-list.html',
  styleUrl: './prescriptions-list.scss',
})
export class PrescriptionsList {
  private readonly service = inject(PrescriptionsService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  data = signal<Prescription[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  page = signal(1);
  pageSize = signal(10);
  ordering = signal('');

  config = computed<CdssTableConfig>(() => ({
    columns: [
      {
        field: 'patient_name',
        header: 'Patient',
        type: 'text',
        sortable: true,
      },
      {
        field: 'consultation_number',
        header: 'consultation',
        type: 'text',
        sortable: true,
      },
      {
        field: 'date_issued',
        header: 'Date',
        type: 'date',
        sortable: true,
      },
      {
        field: 'medication',
        header: 'Medication',
        type: 'text',
        sortable: true,
      },
      {
        field: 'dosage',
        header: 'Dosage',
        type: 'text',
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
    this.loadPrescriptions();
  }

  loadPrescriptions(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.service.getPrescriptions().subscribe({
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
          detail: 'Unable to load prescriptions.',
        });
      },
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.page.set((event.first ?? 0) / (event.rows ?? 10) + 1);
    this.pageSize.set(event.rows ?? 10);
    this.ordering.set((event as any).ordering || '');
    this.loadPrescriptions(false);
  }

  createPrescription(): void {
    this.router.navigate(['/prescriptions/new']);
  }

  onViewPrescription(item: Prescription): void {
    this.router.navigate(['/prescriptions', item.uuid]);
  }

  onEditPrescription(item: Prescription): void {
    this.router.navigate(['/prescriptions', item.uuid, 'edit']);
  }

  deletePrescription(item: Prescription): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this prescription?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.service.deletePrescription(item.uuid).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Prescription deleted successfully.',
            });
            this.loadPrescriptions(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete prescription.',
            });
          },
        });
      },
    });
  }
}
