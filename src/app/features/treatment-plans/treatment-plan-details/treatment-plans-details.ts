import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { TreatmentPlansService } from '../services/treatment-plans.service';
import { TreatmentPlan } from '../models/treatment-plan.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-treatment-plans-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './treatment-plans-details.html',
  styleUrl: './treatment-plans-details.scss',
})
export class TreatmentPlansDetails {
  private readonly service = inject(TreatmentPlansService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<TreatmentPlan | null>(null);

  rows = computed<CdssDetailRow[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'consultation', value: d.consultation || '—', type: 'text', fullWidth: false },
    //   { label: 'Staff', value: d.staff_name || '—', type: 'text', fullWidth: false },
      {
        label: 'Consultation Number',
        value: d.consultation_number || '—',
        type: 'text',
        fullWidth: false,
      },
    //   { label: 'Plan Date', value: d.plan_date || '—', type: 'text', fullWidth: false },
      { label: 'Created At', value: d.created_at || '—', type: 'text', fullWidth: false },
      { label: 'Treatment Type', value: d.treatment_type || '—', type: 'text', fullWidth: false },
      {
        label: 'Status',
        value: d.status || '—',
        type: 'tag',
        tagSeverity:
          d.status === 'approved'
            ? 'success'
            : d.status === 'draft'
              ? 'warn'
              : d.status === 'cancelled'
                ? 'danger'
                : 'secondary',
        fullWidth: false,
      },
      {
        label: 'Estimated Duration',
        value: d.estimated_duration || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Cost Estimate',
        value: d.cost_estimate?.toString() || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Treatment Description',
        value: d.treatment_description || '—',
        type: 'longtext',
        fullWidth: true,
      },
    //   { label: 'Summary', value: d.summary || '—', type: 'longtext', fullWidth: true },
    //   { label: 'Procedures', value: d.procedures || '—', type: 'longtext', fullWidth: true },
    //   { label: 'Instructions', value: d.instructions || '—', type: 'longtext', fullWidth: true },
    //   { label: 'Notes', value: d.notes || '—', type: 'longtext', fullWidth: true },
    ];
  });
  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.loadTreatmentPlan(id);
  }

  loadTreatmentPlan(id: string): void {
    this.service.getTreatmentPlan(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load treatment plan details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/treatment-plans']);
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/treatment-plans', id, 'edit']);
  }
}
