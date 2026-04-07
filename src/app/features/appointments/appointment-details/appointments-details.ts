import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { AppointmentsService } from '../services/appointments.service';
import { Appointment } from '../models/appointment.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-appointments-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './appointments-details.html',
  styleUrl: './appointments-details.scss',
})
export class AppointmentsDetails {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid') || '';

  loading = signal(false);
  appointment = signal<Appointment | null>(null);

  detailRows = computed<CdssDetailRow[]>(() => {
    const appointment = this.appointment();

    if (!appointment) {
      return [];
    }

    return [
      {
        label: 'appointment_number',
        value: appointment.appointment_number || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Patient',
        value: appointment.patient_name || appointment.patient_id || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Staff',
        value: appointment.staff_name || appointment.staff_id || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Clinic',
        value: appointment.clinic_name || appointment.clinic_id || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Created at',
        value: appointment.created_at || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Updated at',
        value: appointment.updated_at || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Appointment Date',
        value: appointment.appointment_date || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Status',
        value: appointment.status || '—',
        type: 'tag',
        tagSeverity:
          appointment.status === 'completed'
            ? 'success'
            : appointment.status === 'cancelled'
              ? 'danger'
              : appointment.status === 'no_show'
                ? 'warn'
                : 'info',
        fullWidth: false,
      },
      {
        label: 'reason_for_visit',
        value: appointment.reason_for_visit || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Notes',
        value: appointment.notes || '—',
        type: 'longtext',
        fullWidth: true,
      },
    ];
  });

  constructor() {
    this.loadAppointment();
  }

  loadAppointment(): void {
    this.loading.set(true);

    this.appointmentsService.getAppointment(this.uuid).subscribe({
      next: (appointment) => {
        this.appointment.set(appointment);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load appointment details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/appointments']);
  }

  onEdit(): void {
    this.router.navigate(['/appointments', this.uuid, 'edit']);
  }
}
