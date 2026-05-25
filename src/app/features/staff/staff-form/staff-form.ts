import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { StaffPayload, StaffService } from '../services/staff.service';
import { ClinicsService } from '../../clinics/services/clinics.service';
import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.scss',
})
export class StaffForm {
  private readonly staffService = inject(StaffService);
  private readonly clinicsService = inject(ClinicsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);
  clinicsLoading = signal(false);

  clinicOptions = signal<CdssSelectOption[]>([]);

  form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: this.isEditMode ? [] : [Validators.required],
    }),
    first_name: new FormControl('', {
      nonNullable: true,
      validators: this.isEditMode ? [] : [Validators.required],
    }),
    last_name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: this.isEditMode ? [Validators.email] : [Validators.required, Validators.email],
    }),
    phone_number: new FormControl('', { nonNullable: true }),
    password: new FormControl('', {
      nonNullable: true,
      validators: this.isEditMode ? [] : [Validators.required, Validators.minLength(8)],
    }),

    designation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    specialization: new FormControl('', { nonNullable: true }),
    license_number: new FormControl('', { nonNullable: true }),
    years_of_experience: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
    clinic: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  formConfig = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Staff' : 'New Staff',
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
        name: 'User Account',
        fieldsInRow: 2,
        fields: [
          { name: 'username', label: 'Username', type: 'text' },
          { name: 'first_name', label: 'First Name', type: 'text' },
          { name: 'last_name', label: 'Last Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone_number', label: 'Phone', type: 'text' },
          ...(this.isEditMode
            ? []
            : [{ name: 'password', label: 'Password', type: 'text' as const }]),
        ],
      },
      {
        name: 'Staff Information',
        fieldsInRow: 2,
        fields: [
          {
            name: 'designation',
            label: 'Designation / Role',
            type: 'select',
            options: [
              { label: 'Dentist', value: 'Dentist' },
              { label: 'Assistant', value: 'Assistant' },
              { label: 'Receptionist', value: 'Receptionist' },
              { label: 'Clinic Admin', value: 'Clinic Admin' },
            ],
          },
          { name: 'specialization', label: 'Specialization', type: 'text' },
          { name: 'license_number', label: 'License Number', type: 'text' },
          {
            name: 'years_of_experience',
            label: 'Years of Experience',
            type: 'number',
          },
          {
            name: 'clinic',
            label: 'Clinic',
            type: 'select',
            options: this.clinicOptions(),
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

    if (this.isEditMode && this.uuid) {
      this.loadStaff(this.uuid);
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

  loadStaff(uuid: string): void {
    this.loading.set(true);

    this.staffService.getStaffMember(uuid).subscribe({
      next: (member: any) => {
        this.form.patchValue({
          username: member.username ?? '',
          first_name: member.first_name ?? member.user_name?.split(' ')?.[0] ?? '',
          last_name: member.last_name ?? '',
          email: member.user_email ?? '',
          phone_number: member.phone_number ?? '',
          password: '',

          designation: member.designation ?? '',
          specialization: member.specialization ?? '',
          license_number: member.license_number ?? '',
          years_of_experience: member.years_of_experience ?? 0,
          clinic: member.clinic ?? '',
          is_active: member.is_active,
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load staff details.',
        });
      },
    });
  }

  onSave(payload: unknown): void {
    const rawPayload = payload as any;

    const staffPayload = { ...rawPayload };

    if (this.isEditMode) {
      delete staffPayload.password;
      delete staffPayload.username;
      delete staffPayload.email;
      delete staffPayload.first_name;
      delete staffPayload.last_name;
      delete staffPayload.phone_number;
    }

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.staffService.updateStaff(this.uuid, staffPayload as StaffPayload)
        : this.staffService.createStaff(staffPayload as StaffPayload);

    request$.subscribe({
      next: (member) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Staff ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/staff', member.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} staff.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/staff', this.uuid]);
      return;
    }

    this.router.navigate(['/staff']);
  }
}
