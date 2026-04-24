import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { StaffPayload, StaffService } from '../services/staff.service';
import { ClinicsService } from '../../clinics/services/clinics.service';
import { UsersService } from '../../users/services/users.service';
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
  private readonly usersService = inject(UsersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);
  clinicsLoading = signal(false);
  usersLoading = signal(false);

  clinicOptions = signal<CdssSelectOption[]>([]);
  userOptions = signal<CdssSelectOption[]>([]);

  form = new FormGroup({
    user: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    designation: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    first_name: new FormControl('', { nonNullable: true }),
    last_name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    phone_number: new FormControl('', { nonNullable: true }),
    role: new FormControl('', { nonNullable: true }),
    specialization: new FormControl('', { nonNullable: true }),
    clinic: new FormControl('', { nonNullable: true }),
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
        name: 'Staff Information',
        fieldsInRow: 2,
        fields: [
          {
            name: 'user',
            label: 'User',
            type: 'select',
            options: this.userOptions(),
          },
          {
            name: 'designation',
            label: 'Designation',
            type: 'text',
          },
          { name: 'first_name', label: 'First Name', type: 'text' },
          { name: 'last_name', label: 'Last Name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'phone_number', label: 'Phone', type: 'text' },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [
              { label: 'Doctor', value: 'doctor' },
              { label: 'Assistant', value: 'assistant' },
              { label: 'Receptionist', value: 'receptionist' },
              { label: 'Administrator', value: 'administrator' },
            ],
          },
          { name: 'specialization', label: 'Specialization', type: 'text' },
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
    this.loadUsers();

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

  loadUsers(): void {
    this.usersLoading.set(true);

    this.usersService.getUsers().subscribe({
      next: (response) => {
        const users = Array.isArray(response) ? response : (response.results ?? []);

        this.userOptions.set(
          users.map((user) => ({
            label:
              [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
              user.username ||
              user.email ||
              user.uuid,
            value: user.uuid,
          })),
        );

        this.usersLoading.set(false);
      },
      error: () => {
        this.usersLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load users.',
        });
      },
    });
  }

  loadStaff(uuid: string): void {
    this.loading.set(true);

    this.staffService.getStaffMember(uuid).subscribe({
      next: (member) => {
        this.form.patchValue({
          user: member.user ?? '',
          designation: member.designation ?? '',
          first_name: member.first_name ?? '',
          last_name: member.last_name ?? '',
          email: member.email ?? '',
          phone_number: member.phone_number ?? '',
          role: member.role ?? '',
          specialization: member.specialization ?? '',
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
    const staffPayload = payload as StaffPayload;

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.staffService.updateStaff(this.uuid, staffPayload)
        : this.staffService.createStaff(staffPayload);

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
