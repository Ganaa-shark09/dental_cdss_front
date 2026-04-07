import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ConsultationsService } from '../services/consultations.service';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-consultations-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './consultations-details.html',
  styleUrl: './consultations-details.scss',
})
export class ConsultationsDetails {
  private readonly service = inject(ConsultationsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<any>(null);

  rows = computed<CdssDetailRow[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Patient',
        value: d.patient_name || d.patient || '—',
        type: 'text',
        fullWidth: false,
      },
      { label: 'Staff', value: d.staff_name || d.staff || '—', type: 'text', fullWidth: false },
      {
        label: 'Appointment',
        value: d.appointment_date || d.appointment || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Consultation Date',
        value: d.consultation_date || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Status',
        value: d.status || '—',
        type: 'tag',
        tagSeverity:
          d.status === 'completed' ? 'success' : d.status === 'cancelled' ? 'danger' : 'info',
        fullWidth: false,
      },
      {
        label: 'Chief Complaint',
        value: d.chief_complaint || '—',
        type: 'longtext',
        fullWidth: true,
      },
      { label: 'Symptoms', value: d.symptoms || '—', type: 'longtext', fullWidth: true },
      { label: 'Diagnosis', value: d.diagnosis || '—', type: 'longtext', fullWidth: true },
      { label: 'Notes', value: d.notes || '—', type: 'longtext', fullWidth: true },
    ];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.loadConsultation(id);
  }

  loadConsultation(id: string): void {
    this.service.getConsultation(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load consultation details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/consultations']);
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/consultations', id, 'edit']);
  }
}
