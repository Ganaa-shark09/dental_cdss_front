import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { PatientsService, PatientPayload } from '../services/patients.service';
import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import { CdssFormConfig } from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-patients-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './patients-form.html',
  styleUrl: './patients-form.scss',
})
export class PatientsForm {
  private readonly patientsService = inject(PatientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);

  form = new FormGroup({
    first_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    last_name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', { nonNullable: true }),
    phone_number: new FormControl('', { nonNullable: true }),
    gender: new FormControl('', { nonNullable: true }),
    date_of_birth: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    state: new FormControl('', { nonNullable: true }),
    country: new FormControl('', { nonNullable: true }),
    postal_code: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  formConfig = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Patient' : 'New Patient',
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
        name: 'Patient Information',
        fieldsInRow: 2,
        fields: [
          { name: 'first_name', label: 'First Name', type: 'text' },
          { name: 'last_name', label: 'Last Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone_number', label: 'Phone', type: 'text' },
          {
            name: 'gender',
            label: 'Gender',
            type: 'select',
            options: [
              { label: 'Male', value: 'MALE' },
              { label: 'Female', value: 'FEMALE' },
              { label: 'Other', value: 'OTHER' },
            ],
          },
          { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
          { name: 'city', label: 'City', type: 'text' },
          { name: 'state', label: 'State', type: 'text' },
          { name: 'country', label: 'Country', type: 'text' },
          { name: 'postal_code', label: 'Postal Code', type: 'text' },
          {
            name: 'address',
            label: 'Address',
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
    if (this.isEditMode && this.uuid) {
      this.loadPatient(this.uuid);
    }
  }

  loadPatient(uuid: string): void {
    this.loading.set(true);

    this.patientsService.getPatient(uuid).subscribe({
      next: (patient) => {
        this.form.patchValue({
          first_name: patient.first_name ?? '',
          last_name: patient.last_name ?? '',
          email: patient.email ?? '',
          phone_number: patient.phone_number ?? '',
          gender: patient.gender ?? '',
          date_of_birth: patient.date_of_birth ?? '',
          address: patient.address ?? '',
          city: patient.city ?? '',
          state: patient.state ?? '',
          country: patient.country ?? '',
          postal_code: patient.postal_code ?? '',
          is_active: patient.is_active,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load patient details.',
        });
      },
    });
  }

  onSave(payload: unknown): void {
    const patientPayload = payload as PatientPayload;

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.patientsService.updatePatient(this.uuid, patientPayload)
        : this.patientsService.createPatient(patientPayload);

    request$.subscribe({
      next: (patient) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Patient ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/patients', patient.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} patient.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/patients', this.uuid]);
      return;
    }

    this.router.navigate(['/patients']);
  }
}
