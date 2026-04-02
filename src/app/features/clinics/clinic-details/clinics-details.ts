import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ClinicsService } from '../services/clinics.service';
import { Clinic } from '../models/clinic.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-clinics-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './clinics-details.html',
  styleUrl: './clinics-details.scss',
})
export class ClinicsDetails {
  private readonly clinicsService = inject(ClinicsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid') || '';

  loading = signal(false);
  clinic = signal<Clinic | null>(null);

  detailRows = computed<CdssDetailRow[]>(() => {
    const clinic = this.clinic();

    if (!clinic) {
      return [];
    }

    return [
      { label: 'Clinic Name', value: clinic.name, type: 'text', fullWidth: false },
      { label: 'Code', value: clinic.code || '—', type: 'text', fullWidth: false },
      { label: 'Email', value: clinic.email || '—', type: 'text', fullWidth: false },
      { label: 'Phone', value: clinic.phone_number || '—', type: 'text', fullWidth: false },
      { label: 'City', value: clinic.city || '—', type: 'text', fullWidth: false },
      { label: 'State', value: clinic.state || '—', type: 'text', fullWidth: false },
      { label: 'Country', value: clinic.country || '—', type: 'text', fullWidth: false },
      { label: 'Postal Code', value: clinic.postal_code || '—', type: 'text', fullWidth: false },
      {
        label: 'Status',
        value: clinic.is_active ? 'Active' : 'Inactive',
        type: 'tag',
        tagSeverity: clinic.is_active ? 'success' : 'danger',
        fullWidth: false,
      },
      {
        label: 'Address',
        value: clinic.address || '—',
        type: 'longtext',
        fullWidth: true,
      },
    ];
  });

  constructor() {
    this.loadClinic();
  }

  loadClinic(): void {
    this.loading.set(true);

    this.clinicsService.getClinic(this.uuid).subscribe({
      next: (clinic) => {
        this.clinic.set(clinic);
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

  onBack(): void {
    this.router.navigate(['/clinics']);
  }

  onEdit(): void {
    this.router.navigate(['/clinics', this.uuid, 'edit']);
  }
}
