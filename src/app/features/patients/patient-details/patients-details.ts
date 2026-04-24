import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { PatientsService } from '../services/patients.service';
import { Patient } from '../models/patient.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-patients-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './patients-details.html',
  styleUrl: './patients-details.scss',
})
export class PatientsDetails {
  private readonly patientsService = inject(PatientsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid') || '';

  loading = signal(false);
  patient = signal<Patient | null>(null);

  detailRows = computed<CdssDetailRow[]>(() => {
    const patient = this.patient();

    if (!patient) {
      return [];
    }

    return [
      { label: 'First Name', value: patient.first_name, type: 'text', fullWidth: false },
      { label: 'Last Name', value: patient.last_name, type: 'text', fullWidth: false },
      { label: 'Email', value: patient.email || '—', type: 'text', fullWidth: false },
      { label: 'Phone', value: patient.phone_number || '—', type: 'text', fullWidth: false },
      { label: 'Gender', value: patient.gender || '—', type: 'text', fullWidth: false },
      {
        label: 'Date of Birth',
        value: patient.date_of_birth || '—',
        type: 'text',
        fullWidth: false,
      },
      { label: 'City', value: patient.city || '—', type: 'text', fullWidth: false },
      { label: 'State', value: patient.state || '—', type: 'text', fullWidth: false },
      { label: 'Country', value: patient.country || '—', type: 'text', fullWidth: false },
      { label: 'Postal Code', value: patient.postal_code || '—', type: 'text', fullWidth: false },
      {
        label: 'Status',
        value: patient.is_active ? 'Active' : 'Inactive',
        type: 'tag',
        tagSeverity: patient.is_active ? 'success' : 'danger',
        fullWidth: false,
      },
      {
        label: 'Address',
        value: patient.address || '—',
        type: 'longtext',
        fullWidth: true,
      },
    ];
  });

  constructor() {
    this.loadPatient();
  }

  loadPatient(): void {
    this.loading.set(true);

    this.patientsService.getPatient(this.uuid).subscribe({
      next: (patient) => {
        this.patient.set(patient);
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

  onBack(): void {
    this.router.navigate(['/patients']);
  }

  onEdit(): void {
    this.router.navigate(['/patients', this.uuid, 'edit']);
  }
}
