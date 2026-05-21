import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { TreatmentPlansService, TreatmentPlanPayload } from '../services/treatment-plans.service';
import { PatientsService } from '../../patients/services/patients.service';
import { StaffService } from '../../staff/services/staff.service';
import { ConsultationsService } from '../../consultations/services/consultations.service';

import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-treatment-plans-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './treatment-plans-form.html',
  styleUrl: './treatment-plans-form.scss',
})
export class TreatmentPlansForm {
  private readonly service = inject(TreatmentPlansService);
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

    plan_date: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    treatment_type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    treatment_description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    summary: new FormControl('', { nonNullable: true }),
    procedures: new FormControl('', { nonNullable: true }),
    estimated_duration: new FormControl('', { nonNullable: true }),
    cost_estimate: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    instructions: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),

    status: new FormControl('draft', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Treatment Plan' : 'New Treatment Plan',
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
            name: 'plan_date',
            label: 'Plan Date',
            type: 'date',
          },
          {
            name: 'title',
            label: 'Title',
            type: 'text',
          },
          {
            name: 'treatment_type',
            label: 'Treatment Type',
            type: 'select',
            options: [
              { label: 'Preventive', value: 'PREVENTIVE' },
              { label: 'Restorative', value: 'RESTORATIVE' },
              { label: 'Surgical', value: 'SURGICAL' },
              { label: 'Orthodontic', value: 'ORTHODONTIC' },
              { label: 'Cosmetic', value: 'COSMETIC' },
              { label: 'Other', value: 'OTHER' },
            ],
          },
          {
            name: 'estimated_duration',
            label: 'Estimated Duration',
            type: 'text',
          },
          {
            name: 'cost_estimate',
            label: 'Cost Estimate',
            type: 'number',
            minFractionDigits: 0,
            maxFractionDigits: 2,
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Planned', value: 'PLANNED' },
              { label: 'In Progress ', value: 'IN_PROGRESS' },
              { label: 'Completed', value: 'COMPLETED' },
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
        name: 'Treatment Details',
        fieldsInRow: 1,
        fields: [
          {
            name: 'treatment_description',
            label: 'Treatment Description',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'summary',
            label: 'Summary',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'procedures',
            label: 'Procedures',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'instructions',
            label: 'Instructions',
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
      this.loadTreatmentPlan(this.uuid);
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
        const items = Array.isArray(response) ? response : (response.results ?? []);
        this.staffOptions.set(
          items.map((member) => ({
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

  loadTreatmentPlan(uuid: string): void {
    this.loading.set(true);

    this.service.getTreatmentPlan(uuid).subscribe({
      next: (plan) => {
        this.form.patchValue({
          patient_id: plan.patient_id ?? '',
          staff_id: plan.staff_id ?? '',
          consultation_id: plan.consultation_uuid ?? '',
          plan_date: plan.plan_date ?? '',
          title: plan.title ?? '',
          treatment_type: plan.treatment_type ?? '',
          treatment_description: plan.treatment_description ?? '',
          summary: plan.summary ?? '',
          procedures: plan.procedures ?? '',
          estimated_duration: plan.estimated_duration ?? '',
          cost_estimate:
            plan.cost_estimate !== undefined && plan.cost_estimate !== null
              ? Number(plan.cost_estimate)
              : null,
          instructions: plan.instructions ?? '',
          notes: plan.notes ?? '',
          status: plan.status ?? 'draft',
          is_active: plan.is_active ?? true,
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load treatment plan details.',
        });
      },
    });
  }

  save(payload: unknown): void {
    const treatmentPlanPayload = payload as TreatmentPlanPayload;

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.service.updateTreatmentPlan(this.uuid, treatmentPlanPayload)
        : this.service.createTreatmentPlan(treatmentPlanPayload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Treatment plan ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/treatment-plans', res.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} treatment plan.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/treatment-plans', this.uuid]);
      return;
    }

    this.router.navigate(['/treatment-plans']);
  }
}
