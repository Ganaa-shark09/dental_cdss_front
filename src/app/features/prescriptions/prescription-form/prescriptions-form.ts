import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { notInFutureValidator } from '../../../shared/utils/date.validators';
import { PrescriptionsService, PrescriptionPayload } from '../services/prescriptions.service';
import { PatientsService } from '../../patients/services/patients.service';
import { StaffService } from '../../staff/services/staff.service';
import { ConsultationsService } from '../../consultations/services/consultations.service';

import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-prescriptions-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './prescriptions-form.html',
  styleUrl: './prescriptions-form.scss',
})
export class PrescriptionsForm {
  private readonly service = inject(PrescriptionsService);
  private readonly patientsService = inject(PatientsService);
  private readonly staffService = inject(StaffService);
  private readonly consultationsService = inject(ConsultationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);
  patientsLoading = signal(false);
  staffLoading = signal(false);
  consultationsLoading = signal(false);

  patientOptions = signal<CdssSelectOption[]>([]);
  staffOptions = signal<CdssSelectOption[]>([]);
  consultationOptions = signal<CdssSelectOption[]>([]);

  form = new FormGroup({
    patient_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    staff_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    consultation_id: new FormControl('', { nonNullable: true }),

    date_issued: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, notInFutureValidator()],
    }),

    medication: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dosage: new FormControl('', { nonNullable: true }),
    frequency: new FormControl('', { nonNullable: true }),
    duration: new FormControl('', { nonNullable: true }),
    treatment_instructions: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    notes: new FormControl('', { nonNullable: true }),

    status: new FormControl('draft', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Prescription' : 'New Prescription',
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
            name: 'consultation_id',
            label: 'Consultation',
            type: 'select',
            options: this.consultationOptions(),
          },
          {
            name: 'date_issued',
            label: 'Date Issued',
            type: 'date',
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'Active', value: 'active' },
              { label: 'Stopped', value: 'stopped' },
              { label: 'Completed', value: 'completed' },
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
        name: 'Medication Details',
        fieldsInRow: 2,
        fields: [
          {
            name: 'medication',
            label: 'Medication',
            type: 'text',
          },
          {
            name: 'dosage',
            label: 'Dosage',
            type: 'text',
          },
          {
            name: 'frequency',
            label: 'Frequency',
            type: 'text',
          },
          {
            name: 'duration',
            label: 'Duration',
            type: 'text',
          },
          {
            name: 'treatment_instructions',
            label: 'Treatment Instructions',
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
      this.loadPrescription(this.uuid);
    }
  }

  loadOptions(): void {
    this.loadPatients();
    this.loadStaff();
    this.loadConsultations();
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

  loadConsultations(): void {
    this.consultationsLoading.set(true);

    this.consultationsService.getConsultations().subscribe({
      next: (response) => {
        const consultations = Array.isArray(response) ? response : (response.results ?? []);

        this.consultationOptions.set(
          consultations.map((consultation) => ({
            label: consultation.consultation_date || consultation.patient_name || consultation.uuid,
            value: consultation.uuid,
          })),
        );

        this.consultationsLoading.set(false);
      },
      error: () => {
        this.consultationsLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load consultations.',
        });
      },
    });
  }

  loadPrescription(uuid: string): void {
    this.loading.set(true);

    this.service.getPrescription(uuid).subscribe({
      next: (prescription) => {
        this.form.patchValue({
          patient_id: prescription.patient_id ?? '',
          staff_id: prescription.staff_id ?? '',
          consultation_id: prescription.consultation_id ?? '',
          date_issued: (prescription as any).date_issued ?? '',
          medication: (prescription as any).medication ?? '',
          dosage: prescription.dosage ?? '',
          frequency: prescription.frequency ?? '',
          duration: prescription.duration ?? '',
          treatment_instructions: (prescription as any).treatment_instructions ?? '',
          notes: prescription.notes ?? '',
          status: prescription.status ?? 'draft',
          is_active: prescription.is_active ?? true,
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load prescription details.',
        });
      },
    });
  }

  save(payload: unknown): void {
    const prescriptionPayload = payload as PrescriptionPayload;

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.service.updatePrescription(this.uuid, prescriptionPayload)
        : this.service.createPrescription(prescriptionPayload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Prescription ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/prescriptions', res.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} prescription.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/prescriptions', this.uuid]);
      return;
    }

    this.router.navigate(['/prescriptions']);
  }
}
