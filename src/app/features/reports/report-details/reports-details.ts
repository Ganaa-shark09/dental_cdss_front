import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ReportsService } from '../services/reports.service';
import { ReportRecord } from '../models/report.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-reports-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './reports-details.html',
  styleUrl: './reports-details.scss',
})
export class ReportsDetails {
  private readonly service = inject(ReportsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<ReportRecord | null>(null);

  rows = computed<CdssDetailRow[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Consultation',
        value: d.consultation_number || '—',
        type: 'text',
        fullWidth: false,
      },
      { label: 'Report Type', value: d.report_type || '—', type: 'text', fullWidth: false },
      {
        label: 'Status',
        value: d.is_active ? 'Active' : 'Inactive',
        type: 'tag',
        tagSeverity: d.is_active ? 'success' : 'danger',
        fullWidth: false,
      },
      {
        label: 'Prescription Summary',
        value: d.prescription_summary
          ? `${d.prescription_summary.medication || '—'}${d.prescription_summary.dosage ? ` - ${d.prescription_summary.dosage}` : ''}`
          : '—',
        type: 'text',
        fullWidth: true,
      },
      {
        label: 'Treatment Plan Summary',
        value: d.treatment_plan_summary
          ? `${d.treatment_plan_summary.treatment_type || '—'}${d.treatment_plan_summary.status ? ` - ${d.treatment_plan_summary.status}` : ''}`
          : '—',
        type: 'text',
        fullWidth: true,
      },
      {
        label: 'Documents',
        value: d.documents?.length
          ? d.documents.map((item) => item.document_type || 'Document').join(', ')
          : '—',
        type: 'longtext',
        fullWidth: true,
      },
      {
        label: 'Notes',
        value: d.notes || '—',
        type: 'longtext',
        fullWidth: true,
      },
    ];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.load(id);
  }

  load(id: string): void {
    this.service.getReport(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load report details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/reports']);
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/reports', id, 'edit']);
  }
}
