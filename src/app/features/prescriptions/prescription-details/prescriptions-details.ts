import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { PrescriptionsService } from '../services/prescriptions.service';
import { Prescription } from '../models/prescription.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-prescriptions-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './prescriptions-details.html',
  styleUrl: './prescriptions-details.scss',
})
export class PrescriptionsDetails {
  private readonly service = inject(PrescriptionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<Prescription | null>(null);

  rows = computed<CdssDetailRow[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Patient', value: d.patient_name || '—', type: 'text', fullWidth: false },
      {
        label: 'consultation_number',
        value: d.consultation_number || '—',
        type: 'text',
        fullWidth: false,
      },
      { label: 'Date Issued', value: d.date_issued || '—', type: 'text', fullWidth: false },
      { label: 'Medication', value: d.medication || '—', type: 'text', fullWidth: false },
      { label: 'Dosage', value: d.dosage || '—', type: 'text', fullWidth: false },
      { label: 'expiry_date', value: d.expiry_date || '—', type: 'text', fullWidth: false },
      {
        label: 'Treatment Instructions',
        value: d.treatment_instructions || '—',
        type: 'longtext',
        fullWidth: true,
      },
      { label: 'Notes', value: d.notes || '—', type: 'longtext', fullWidth: true },
    ];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.loadPrescription(id);
  }

  loadPrescription(id: string): void {
    this.service.getPrescription(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load prescription details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/prescriptions']);
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/prescriptions', id, 'edit']);
  }
}
