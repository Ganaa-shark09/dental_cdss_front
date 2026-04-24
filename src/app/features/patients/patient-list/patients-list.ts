import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { PatientsService } from '../services/patients.service';
import { Patient } from '../models/patient.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';
import { CdssDeleteButton } from '../../../shared/components/buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton, CdssDeleteButton],
  providers: [ConfirmationService],
  templateUrl: './patients-list.html',
  styleUrl: './patients-list.scss',
})
export class PatientsList {
  private readonly patientsService = inject(PatientsService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  patients = signal<Patient[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  page = signal(1);
  pageSize = signal(10);
  ordering = signal('');

  tableConfig = computed<CdssTableConfig>(() => ({
    columns: [
      {
        field: 'first_name',
        header: 'First Name',
        type: 'text',
        sortable: true,
      },
      {
        field: 'last_name',
        header: 'Last Name',
        type: 'text',
        sortable: true,
      },
      { field: 'email', header: 'Email', type: 'text', sortable: true },
      { field: 'phone_number', header: 'Phone', type: 'text' },
      { field: 'gender', header: 'Gender', type: 'text', sortable: true },
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
    this.loadPatients();
  }

  loadPatients(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.patientsService
      .getPatients({
        page: this.page(),
        page_size: this.pageSize(),
        ordering: this.ordering() || undefined,
      })
      .subscribe({
        next: (response) => {
          const patients = Array.isArray(response) ? response : (response.results ?? []);

          const total = Array.isArray(response)
            ? response.length
            : (response.count ?? patients.length);

          this.patients.set(patients);
          this.totalRecords.set(total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Load failed',
            detail: 'Unable to load patients.',
          });
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.page.set((event.first ?? 0) / (event.rows ?? 10) + 1);
    this.pageSize.set(event.rows ?? 10);
    this.ordering.set((event as any).ordering || '');
    this.loadPatients(false);
  }

  createPatient(): void {
    this.router.navigate(['/patients/new']);
  }

  onViewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.uuid]);
  }

  onEditPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.uuid, 'edit']);
  }

  deletePatient(patient: Patient): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${patient.first_name} ${patient.last_name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.patientsService.deletePatient(patient.uuid).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Patient deleted successfully.',
            });
            this.loadPatients(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete patient.',
            });
          },
        });
      },
    });
  }
}
