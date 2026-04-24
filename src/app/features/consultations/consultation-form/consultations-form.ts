import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ConsultationsService, ConsultationPayload } from '../services/consultations.service';
import { PatientsService } from '../../patients/services/patients.service';
import { StaffService } from '../../staff/services/staff.service';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { ClinicsService } from '../../clinics/services/clinics.service';

import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-consultations-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './consultations-form.html',
  styleUrl: './consultations-form.scss',
})
export class ConsultationsForm {
  private readonly service = inject(ConsultationsService);
  private readonly patientsService = inject(PatientsService);
  private readonly staffService = inject(StaffService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly clinicsService = inject(ClinicsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);
  patientsLoading = signal(false);
  staffLoading = signal(false);
  appointmentsLoading = signal(false);
  clinicsLoading = signal(false);

  patientOptions = signal<CdssSelectOption[]>([]);
  staffOptions = signal<CdssSelectOption[]>([]);
  appointmentOptions = signal<CdssSelectOption[]>([]);
  clinicOptions = signal<CdssSelectOption[]>([]);

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
    appointment_id: new FormControl('', { nonNullable: true }),

    consultation_date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    consultation_time: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    chief_complaint: new FormControl('', { nonNullable: true }),
    symptoms: new FormControl('', { nonNullable: true }),
    diagnosis: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),

    status: new FormControl('draft', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Consultation' : 'New Consultation',
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
        name: 'General Information',
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
            name: 'appointment_id',
            label: 'Appointment',
            type: 'select',
            options: this.appointmentOptions(),
          },
          {
            name: 'consultation_date',
            label: 'Consultation Date',
            type: 'date',
          },
          {
            name: 'consultation_time',
            label: 'Consultation Time',
            type: 'time',
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Draft', value: 'DRAFT' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ],
          },
          {
            name: 'is_active',
            label: 'Active',
            type: 'boolean',
            fullWidth: true,
          },
        ],
      },
      {
        name: 'Clinical Notes',
        fieldsInRow: 1,
        fields: [
          {
            name: 'chief_complaint',
            label: 'Chief Complaint',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'symptoms',
            label: 'Symptoms',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'diagnosis',
            label: 'Diagnosis',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
        ],
      },
    ],
  }));

  constructor() {
    this.loadOptions();

    if (this.isEditMode && this.uuid) {
      this.loadConsultation(this.uuid);
    }
  }

  loadOptions(): void {
    this.loadPatients();
    this.loadStaff();
    this.loadAppointments();
    this.loadClinics();
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

  loadAppointments(): void {
    this.appointmentsLoading.set(true);

    this.appointmentsService.getAppointments().subscribe({
      next: (response) => {
        const appointments = Array.isArray(response) ? response : (response.results ?? []);

        this.appointmentOptions.set(
          appointments.map((appointment) => ({
            label: appointment.appointment_date || appointment.patient_name || appointment.uuid,
            value: appointment.uuid,
          })),
        );

        this.appointmentsLoading.set(false);
      },
      error: () => {
        this.appointmentsLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load appointments.',
        });
      },
    });
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

  loadConsultation(uuid: string): void {
    this.loading.set(true);

    this.service.getConsultation(uuid).subscribe({
      next: (consultation) => {
        this.form.patchValue({
          patient_id: (consultation as any).patient_id ?? consultation.patient ?? '',
          staff_id: (consultation as any).staff_id ?? consultation.staff ?? '',
          clinic_id: (consultation as any).clinic_id ?? (consultation as any).clinic ?? '',
          appointment_id: (consultation as any).appointment_id ?? consultation.appointment ?? '',
          consultation_date: consultation.consultation_date ?? '',
          consultation_time: (consultation as any).consultation_time ?? '',
          chief_complaint: consultation.chief_complaint ?? '',
          symptoms: consultation.symptoms ?? '',
          diagnosis: consultation.diagnosis ?? '',
          notes: consultation.notes ?? '',
          status: consultation.status ?? 'draft',
          is_active: consultation.is_active ?? true,
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load consultation details.',
        });
      },
    });
  }

  save(payload: unknown): void {
    const formValue = payload as ConsultationPayload;

    const consultationPayload: ConsultationPayload = {
      ...formValue,
      consultation_time: this.normalizeTime(formValue.consultation_time),
    };

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.service.updateConsultation(this.uuid, consultationPayload)
        : this.service.createConsultation(consultationPayload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Consultation ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/consultations', res.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} consultation.`,
        });
      },
    });
  }

  private normalizeTime(value: string): string {
    if (!value) return '';
    return value.length === 5 ? `${value}:00` : value;
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/consultations', this.uuid]);
      return;
    }

    this.router.navigate(['/consultations']);
  }
}
