import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import { CdssService } from '../services/cdss.service';
import { CdssEngine, CdssRecommendationRow, PerToothResult } from '../models/cdss-engine.model';
import {
  CdssDetails as SharedCdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';

@Component({
  selector: 'app-cdss-details-page',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, DividerModule, SharedCdssDetails, CdssBackButton, CdssSaveButton, CdssTable],
  templateUrl: './cdss-details.html',
  styleUrl: './cdss-details.scss',
})
export class CdssDetails {
  private readonly service = inject(CdssService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<CdssEngine | null>(null);
  recommendationRows = signal<CdssRecommendationRow[]>([]);
  loading = signal(false);

  perToothEntries = computed<Array<{ tooth: string; result: PerToothResult }>>(() => {
    const d = this.data();
    if (!d?.per_tooth_results) return [];
    return Object.entries(d.per_tooth_results).map(([tooth, result]) => ({ tooth, result }));
  });

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
      { label: 'Risk Score', value: d.risk_score || '—', type: 'text', fullWidth: false },
      {
        label: 'Status',
        value: d.is_active ? 'Active' : 'Inactive',
        type: 'tag',
        tagSeverity: d.is_active ? 'success' : 'danger',
        fullWidth: false,
      },
      {
        label: 'Diagnosis Assistance',
        value: d.diagnosis_assistance || '—',
        type: 'longtext',
        fullWidth: true,
      },
      {
        label: 'Alerts',
        value: d.alerts?.length ? d.alerts.join('\n') : '—',
        type: 'longtext',
        fullWidth: true,
      },
      {
        label: 'Recommendations',
        value: d.recommendations?.length ? d.recommendations.join('\n') : '—',
        type: 'longtext',
        fullWidth: true,
      },
    ];
  });

  recommendationTableConfig = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'consultation_number', header: 'Consultation', type: 'text' },
      { field: 'recommendation', header: 'Recommendation', type: 'text' },
      {
        field: 'is_active',
        header: 'Status',
        type: 'tag',
        customFormat: (value: boolean) => (value ? 'Active' : 'Inactive'),
        tagSeverityFn: (value: boolean) => (value ? 'success' : 'danger'),
      },
      { field: 'created_at', header: 'Created', type: 'text' },
    ],
    dataKey: 'uuid',
    showViewButton: false,
    showEditButton: false,
    showDeleteButton: false,
    scrollHeight: '260px',
  }));

  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);

    this.service.getCdssEngine(id).subscribe({
      next: (engine) => {
        this.data.set(engine);

        this.service.getCdssRecommendations(id).subscribe({
          next: (rows) => {
            this.recommendationRows.set(rows);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Load failed',
              detail: 'Unable to load recommendation rows.',
            });
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load CDSS engine details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/cdss']);
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/cdss', id, 'edit']);
  }

  onNewWizard(): void {
    this.router.navigate(['/cdss/wizard']);
  }

  onPrint(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/cdss', id, 'print']);
  }

  confidenceSeverity(score?: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (score?.toUpperCase()) {
      case 'HIGH': return 'success';
      case 'MODERATE': return 'info';
      case 'LOW': return 'warn';
      default: return 'danger';
    }
  }
}
