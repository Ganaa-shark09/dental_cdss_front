import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { CdssService } from '../services/cdss.service';
import { CdssEngine } from '../models/cdss-engine.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';

@Component({
  selector: 'app-cdss-history',
  standalone: true,
  imports: [CardModule, CdssTable, CdssNewButton],
  templateUrl: './cdss-history.html',
  styleUrl: './cdss-history.scss',
})
export class CdssHistory {
  private readonly service = inject(CdssService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<CdssEngine[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  config = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'consultation_number', header: 'Consultation', type: 'text', sortable: true },
      { field: 'risk_score', header: 'Risk Score', type: 'text', sortable: true },
      { field: 'diagnosis_assistance', header: 'Diagnosis Assistance', type: 'text' },
      {
        field: 'is_active',
        header: 'Status',
        type: 'tag',
        customFormat: (value: boolean) => (value ? 'Active' : 'Inactive'),
        tagSeverityFn: (value: boolean) => (value ? 'success' : 'danger'),
      },
      { field: 'created_at', header: 'Created', type: 'text', sortable: true },
    ],
    dataKey: 'uuid',
    showViewButton: true,
    showEditButton: true,
    showDeleteButton: false,
    scrollHeight: 'clamp(320px, 55vh, 420px)',
  }));

  constructor() {
    this.load();
  }

  load(showLoader = true): void {
    if (showLoader) this.loading.set(true);

    this.service.getCdssEngines().subscribe({
      next: (items) => {
        this.data.set(items);
        this.totalRecords.set(items.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load CDSS history.',
        });
      },
    });
  }

  onLazyLoad(_: TableLazyLoadEvent): void {
    this.load(false);
  }

  onAnalyze(): void {
    this.router.navigate(['/cdss/wizard']);
  }

  onView(item: CdssEngine): void {
    if (!item.uuid) return;
    this.router.navigate(['/cdss', item.uuid]);
  }

  onEdit(item: CdssEngine): void {
    if (!item.uuid) return;
    this.router.navigate(['/cdss', item.uuid, 'edit']);
  }
}
