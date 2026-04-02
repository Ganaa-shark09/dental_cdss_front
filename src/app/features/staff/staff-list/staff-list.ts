import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { StaffService } from '../services/staff.service';
import { Staff } from '../models/staff.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';
import { CdssDeleteButton } from '../../../shared/components/buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton, CdssDeleteButton],
  providers: [ConfirmationService],
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.scss',
})
export class StaffList {
  private readonly staffService = inject(StaffService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  staffMembers = signal<Staff[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  page = signal(1);
  pageSize = signal(10);
  ordering = signal('');

  tableConfig = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'first_name', header: 'First Name', type: 'text', sortable: true },
      { field: 'last_name', header: 'Last Name', type: 'text', sortable: true },
      { field: 'email', header: 'Email', type: 'text', sortable: true },
      { field: 'phone_number', header: 'Phone', type: 'text' },
      { field: 'role', header: 'Role', type: 'text', sortable: true },
      { field: 'specialization', header: 'Specialization', type: 'text' },
      { field: 'clinic_name', header: 'Clinic', type: 'text', sortable: true },
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
    this.loadStaff();
  }

  loadStaff(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.staffService
      .getStaff({
        page: this.page(),
        page_size: this.pageSize(),
        ordering: this.ordering() || undefined,
      })
      .subscribe({
        next: (response) => {
          const staffMembers = Array.isArray(response) ? response : (response.results ?? []);

          const total = Array.isArray(response)
            ? response.length
            : (response.count ?? staffMembers.length);

          this.staffMembers.set(staffMembers);
          this.totalRecords.set(total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Load failed',
            detail: 'Unable to load staff.',
          });
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.page.set((event.first ?? 0) / (event.rows ?? 10) + 1);
    this.pageSize.set(event.rows ?? 10);
    this.ordering.set((event as any).ordering || '');
    this.loadStaff(false);
  }

  createStaff(): void {
    this.router.navigate(['/staff/new']);
  }

  onViewStaff(member: Staff): void {
    this.router.navigate(['/staff', member.uuid]);
  }

  onEditStaff(member: Staff): void {
    this.router.navigate(['/staff', member.uuid, 'edit']);
  }

  deleteStaff(member: Staff): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${member.first_name} ${member.last_name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.staffService.deleteStaff(member.uuid).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Staff deleted successfully.',
            });
            this.loadStaff(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete staff.',
            });
          },
        });
      },
    });
  }
}
