import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ClinicsService, ClinicPayload } from '../services/clinics.service';
import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import { CdssFormConfig } from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-clinics-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './clinics-form.html',
  styleUrl: './clinics-form.scss',
})
export class ClinicsForm {
  private readonly clinicsService = inject(ClinicsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    code: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    phone_number: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    state: new FormControl('', { nonNullable: true }),
    country: new FormControl('', { nonNullable: true }),
    postal_code: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  formConfig = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Clinic' : 'New Clinic',
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
        name: 'Clinic Information',
        fieldsInRow: 2,
        fields: [
          { name: 'name', label: 'Clinic Name', type: 'text' },
          { name: 'code', label: 'Code', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone_number', label: 'Phone', type: 'text' },
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
      this.loadClinic(this.uuid);
    }
  }

  loadClinic(uuid: string): void {
    this.loading.set(true);

    this.clinicsService.getClinic(uuid).subscribe({
      next: (clinic) => {
        this.form.patchValue({
          name: clinic.name ?? '',
          code: clinic.code ?? '',
          email: clinic.email ?? '',
          phone_number: clinic.phone_number ?? '',
          address: clinic.address ?? '',
          city: clinic.city ?? '',
          state: clinic.state ?? '',
          country: clinic.country ?? '',
          postal_code: clinic.postal_code ?? '',
          is_active: clinic.is_active,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load clinic details.',
        });
      },
    });
  }

  onSave(payload: unknown): void {
    const clinicPayload = payload as ClinicPayload;

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.clinicsService.updateClinic(this.uuid, clinicPayload)
        : this.clinicsService.createClinic(clinicPayload);

    request$.subscribe({
      next: (clinic) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Clinic ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/clinics', clinic.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} clinic.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/clinics', this.uuid]);
      return;
    }

    this.router.navigate(['/clinics']);
  }
}
