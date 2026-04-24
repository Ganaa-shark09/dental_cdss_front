import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { AppointmentsService } from '../services/appointments.service';
import { Appointment } from '../models/appointment.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton],
  providers: [ConfirmationService],
  templateUrl: './appointments-list.html',
  styleUrl: './appointments-list.scss',
})
export class AppointmentsList {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  page = signal(1);
  pageSize = signal(10);
  ordering = signal('');

  tableConfig = computed<CdssTableConfig>(() => ({
    columns: [
        {
        field: 'appointment_number',
        header: 'Appointment',
        type: 'text',
        sortable: true,
      },
      {
        field: 'patient_name',
        header: 'Patient',
        type: 'text',
        sortable: true,
      },
      {
        field: 'staff_name',
        header: 'Staff',
        type: 'text',
        sortable: true,
      },
      {
        field: 'clinic_name',
        header: 'Clinic',
        type: 'text',
        sortable: true,
      },
      {
        field: 'appointment_date',
        header: 'Appointment Date',
        type: 'date',
        sortable: true,
      },
      {
        field: 'status',
        header: 'Status',
        type: 'tag',
        customFormat: (value: string) => value || '—',
        tagSeverityFn: (value: string) => {
          switch (value) {
            case 'scheduled':
              return 'info';
            case 'completed':
              return 'success';
            case 'cancelled':
              return 'danger';
            case 'no_show':
              return 'warn';
            default:
              return 'secondary';
          }
        },
        sortable: true,
      },
      {
        field: 'reason',
        header: 'Reason',
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
    this.loadAppointments();
  }

  loadAppointments(showLoader = true): void {
    if (showLoader) {
      this.loading.set(true);
    }

    this.appointmentsService
      .getAppointments({
        page: this.page(),
        page_size: this.pageSize(),
        ordering: this.ordering() || undefined,
      })
      .subscribe({
        next: (response) => {
          const appointments = Array.isArray(response) ? response : (response.results ?? []);

          const total = Array.isArray(response)
            ? response.length
            : (response.count ?? appointments.length);

          this.appointments.set(appointments);
          this.totalRecords.set(total);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Load failed',
            detail: 'Unable to load appointments.',
          });
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.page.set((event.first ?? 0) / (event.rows ?? 10) + 1);
    this.pageSize.set(event.rows ?? 10);
    this.ordering.set((event as any).ordering || '');
    this.loadAppointments(false);
  }

  createAppointment(): void {
    this.router.navigate(['/appointments/new']);
  }

  onViewAppointment(appointment: Appointment): void {
    this.router.navigate(['/appointments', appointment.uuid]);
  }

  onEditAppointment(appointment: Appointment): void {
    this.router.navigate(['/appointments', appointment.uuid, 'edit']);
  }

  deleteAppointment(appointment: Appointment): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this appointment?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        this.appointmentsService.deleteAppointment(appointment.uuid).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Appointment deleted successfully.',
            });
            this.loadAppointments(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete appointment.',
            });
          },
        });
      },
    });
  }
}
