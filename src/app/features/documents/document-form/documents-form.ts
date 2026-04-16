import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { DocumentsService, DocumentPayload } from '../services/documents.service';
import { PatientsService } from '../../patients/services/patients.service';
import { ConsultationsService } from '../../consultations/services/consultations.service';
import { ClinicsService } from '../../clinics/services/clinics.service';

import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-documents-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './documents-form.html',
  styleUrl: './documents-form.scss',
})
export class DocumentsForm {
  private readonly service = inject(DocumentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly consultationsService = inject(ConsultationsService);
  private readonly clinicsService = inject(ClinicsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);
  patientsLoading = signal(false);
  consultationsLoading = signal(false);
  clinicsLoading = signal(false);

  patientOptions = signal<CdssSelectOption[]>([]);
  consultationOptions = signal<CdssSelectOption[]>([]);
  clinicOptions = signal<CdssSelectOption[]>([]);

  form = new FormGroup({
    patient_id: new FormControl('', { nonNullable: true }),
    consultation_id: new FormControl('', { nonNullable: true }),
    clinic_id: new FormControl('', { nonNullable: true }),

    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    document_type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', { nonNullable: true }),
    document: new FormControl<File | null>(null, {
      validators: [Validators.required],
    }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Document' : 'New Document',
    formGroup: this.form,
    showToolbar: true,
    fieldsInRow: 2,
    toolbar: {
      showBack: true,
      showReset: true,
      showSave: true,
      saveLabel: this.isEditMode ? 'Update' : 'Upload',
    },
    groups: [
      {
        name: 'Document Information',
        fieldsInRow: 2,
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'text',
          },
          {
            name: 'document_type',
            label: 'Document Type',
            type: 'select',
            options: [
              { label: 'Prescription', value: 'prescription' },
              { label: 'Lab Report', value: 'lab_report' },
              { label: 'X-Ray', value: 'xray' },
              { label: 'Invoice', value: 'invoice' },
              { label: 'Consent Form', value: 'consent_form' },
              { label: 'Other', value: 'other' },
            ],
          },
          {
            name: 'patient_id',
            label: 'Patient',
            type: 'select',
            options: this.patientOptions(),
          },
          {
            name: 'consultation_id',
            label: 'Consultation',
            type: 'select',
            options: this.consultationOptions(),
          },
          {
            name: 'clinic_id',
            label: 'Clinic',
            type: 'select',
            options: this.clinicOptions(),
          },
          {
            name: 'document',
            label: 'Document File',
            type: 'file',
            accept: '.pdf,.png,.jpg,.jpeg,.doc,.docx',
            fullWidth: true,
          },
          {
            name: 'description',
            label: 'Description',
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
    this.loadOptions();

    if (this.isEditMode && this.uuid) {
      this.loadDocument(this.uuid);
    }
  }

  loadOptions(): void {
    this.loadPatients();
    this.loadConsultations();
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
      },
    });
  }

  loadDocument(uuid: string): void {
    this.loading.set(true);

    this.service.getDocument(uuid).subscribe({
      next: (doc) => {
        this.form.patchValue({
          patient_id: doc.patient_id ?? '',
          consultation_id: doc.consultation_id ?? '',
          clinic_id: doc.clinic_id ?? '',
          title: doc.title ?? '',
          document_type: doc.document_type ?? '',
          description: doc.description ?? '',
          is_active: doc.is_active ?? true,
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load document details.',
        });
      },
    });
  }

  save(payload: unknown): void {
    const documentPayload = payload as DocumentPayload;

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.service.updateDocument(this.uuid, documentPayload)
        : this.service.createDocument(documentPayload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Uploaded',
          detail: `Document ${this.isEditMode ? 'updated' : 'uploaded'} successfully.`,
        });
        this.router.navigate(['/documents', res.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'upload'} document.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/documents', this.uuid]);
      return;
    }

    this.router.navigate(['/documents']);
  }
}
