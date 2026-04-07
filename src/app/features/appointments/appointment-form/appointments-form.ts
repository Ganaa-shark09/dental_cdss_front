import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { AppointmentsService, AppointmentPayload } from '../services/appointments.service';
import { ClinicsService } from '../../clinics/services/clinics.service';
import { PatientsService } from '../../patients/services/patients.service';
import { StaffService } from '../../staff/services/staff.service';
import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-appointments-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './appointments-form.html',
  styleUrl: './appointments-form.scss',
})
export class AppointmentsForm {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly clinicsService = inject(ClinicsService);
  private readonly patientsService = inject(PatientsService);
  private readonly staffService = inject(StaffService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);
  clinicsLoading = signal(false);
  patientsLoading = signal(false);
  staffLoading = signal(false);

  clinicOptions = signal<CdssSelectOption[]>([]);
  patientOptions = signal<CdssSelectOption[]>([]);
  staffOptions = signal<CdssSelectOption[]>([]);

  formatDate(date: any): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  form = new FormGroup({
    patient_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    staff_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    clinic_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    appointment_date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    appointment_time: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    status: new FormControl('scheduled', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reason: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  formConfig = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Appointment' : 'New Appointment',
    formGroup: this.form,
    showToolbar: true,
    fieldsInRow: 2,
    toolbar: {
      showBack: true,
      showReset: true,
      showSave: true,
      saveLabel: this.isEditMode ? 'Update' : 'Save',
    },
    groups: [
      {
        name: 'Appointment Information',
        fieldsInRow: 2,
        fields: [
          {
            name: 'patient_id',
            label: 'Patient',
            type: 'select',
            options: this.patientOptions(),
          },
          {
            name: 'staff_id',
            label: 'Staff',
            type: 'select',
            options: this.staffOptions(),
          },
          {
            name: 'clinic_id',
            label: 'Clinic',
            type: 'select',
            options: this.clinicOptions(),
          },
          {
            name: 'appointment_date',
            label: 'Appointment Date',
            type: 'date',
          },
          {
            name: 'appointment_time',
            label: 'Appointment Time',
            type: 'time',
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'Confirmed', value: 'CONFIRMED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'No Show', value: 'no_show' },
            ],
          },
          {
            name: 'reason',
            label: 'reason for visit',
            type: 'text',
          },
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'is_active',
            label: 'Active',
            type: 'boolean',
            fullWidth: true,
          },
        ],
      },
    ],
  }));

  constructor() {
    this.loadClinics();
    this.loadPatients();
    this.loadStaff();

    if (this.isEditMode && this.uuid) {
      this.loadAppointment(this.uuid);
    }
  }

  loadClinics(): void {
    this.clinicsLoading.set(true);

    this.clinicsService.getClinics().subscribe({
      next: (response) => {
        const clinics = Array.isArray(response) ? response : (response.results ?? []);

        this.clinicOptions.set(
          clinics.map((clinic) => ({
            label: clinic.name,
            value: clinic.uuid,
          })),
        );

        this.clinicsLoading.set(false);
      },
      error: () => {
        this.clinicsLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load clinics.',
        });
      },
    });
  }

  loadPatients(): void {
    this.patientsLoading.set(true);

    this.patientsService.getPatients().subscribe({
      next: (response) => {
        const patients = Array.isArray(response) ? response : (response.results ?? []);

        this.patientOptions.set(
          patients.map((patient) => ({
            label:
              `${patient.first_name || ''} ${patient.last_name || ''}`.trim() ||
              patient.email ||
              patient.uuid,
            value: patient.uuid,
          })),
        );

        this.patientsLoading.set(false);
      },
      error: () => {
        this.patientsLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load patients.',
        });
      },
    });
  }

  loadStaff(): void {
    this.staffLoading.set(true);

    this.staffService.getStaff().subscribe({
      next: (response) => {
        const staffMembers = Array.isArray(response) ? response : (response.results ?? []);

        this.staffOptions.set(
          staffMembers.map((member) => ({
            label: `${member.user_name || ''}`.trim() || member.user_email || member.uuid,
            value: member.uuid,
          })),
        );

        this.staffLoading.set(false);
      },
      error: () => {
        this.staffLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load staff.',
        });
      },
    });
  }

  loadAppointment(uuid: string): void {
    this.loading.set(true);

    this.appointmentsService.getAppointment(uuid).subscribe({
      next: (appointment) => {
        this.form.patchValue({
          appointment_date: appointment.appointment_date ?? '',
          appointment_time: appointment.appointment_time ?? '',
          patient_id: appointment.patient_id ?? appointment.patient_id ?? '',
          staff_id: appointment.staff_id ?? appointment.staff_id ?? '',
          clinic_id: appointment.clinic_id ?? appointment.clinic_id ?? '',
          status: appointment.status ?? 'scheduled',
          reason: appointment.reason_for_visit ?? '',
          notes: appointment.notes ?? '',
          is_active: appointment.is_active ?? true,
        });
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

  onSave(payload: unknown): void {
    const formValue = payload as {
      patient_id: string;
      staff_id: string;
      clinic_id: string;
      appointment_date: string;
      appointment_time: string;
      status: string;
      reason_for_visit?: string;
      notes?: string;
      is_active?: boolean;
    };

    const appointmentPayload: AppointmentPayload = {
      patient_id: formValue.patient_id,
      staff_id: formValue.staff_id,
      clinic_id: formValue.clinic_id,
      appointment_date: formValue.appointment_date,
      appointment_time: formValue.appointment_time,
      status: formValue.status,
      reason: formValue.reason_for_visit,
      notes: formValue.notes,
      is_active: formValue.is_active,
    };

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.appointmentsService.updateAppointment(this.uuid, appointmentPayload)
        : this.appointmentsService.createAppointment(appointmentPayload);

    request$.subscribe({
      next: (appointment) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Appointment ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/appointments', appointment.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} appointment.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/appointments', this.uuid]);
      return;
    }

    this.router.navigate(['/appointments']);
  }
}
