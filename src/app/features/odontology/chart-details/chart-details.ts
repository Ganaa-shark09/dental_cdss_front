import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { OdontologyService } from '../services/odontology.service';
import { DentalChart, ToothRecord } from '../models/odontology.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { ToothRecordForm } from '../tooth-record-form/tooth-record-form';

@Component({
  selector: 'app-chart-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton, CdssTable, ToothRecordForm],
  templateUrl: './chart-details.html',
  styleUrl: './chart-details.scss',
})
export class ChartDetails {
  private readonly service = inject(OdontologyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  chart = signal<DentalChart | null>(null);
  toothRecords = signal<ToothRecord[]>([]);
  loading = signal(false);

  showToothForm = signal(false);
  selectedToothRecord = signal<ToothRecord | null>(null);

  rows = computed<CdssDetailRow[]>(() => {
    const d = this.chart();
    if (!d) return [];

    return [
      {
        label: 'Consultation',
        value: d.consultation_number || '—',
        type: 'text',
        fullWidth: false,
      },
      {
        label: 'Status',
        value: d.is_active ? 'Active' : 'Inactive',
        type: 'tag',
        tagSeverity: d.is_active ? 'success' : 'danger',
        fullWidth: false,
      },
      { label: 'Notes', value: d.notes || '—', type: 'longtext', fullWidth: true },
    ];
  });

  toothTableConfig = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'tooth_number', header: 'Tooth', type: 'text', sortable: true },
      { field: 'condition', header: 'Condition', type: 'text', sortable: true },
      {
        field: 'surfaces',
        header: 'Surfaces',
        type: 'text',
        customFormat: (value: string[]) => (Array.isArray(value) ? value.join(', ') : '—'),
      },
      { field: 'mobility_grade', header: 'Mobility', type: 'text' },
      {
        field: 'percussion_tenderness',
        header: 'Percussion',
        type: 'tag',
        customFormat: (value: boolean) => (value ? 'Yes' : 'No'),
        tagSeverityFn: (value: boolean) => (value ? 'warn' : 'success'),
      },
      {
        field: 'palpation_tenderness',
        header: 'Palpation',
        type: 'tag',
        customFormat: (value: boolean) => (value ? 'Yes' : 'No'),
        tagSeverityFn: (value: boolean) => (value ? 'warn' : 'success'),
      },
    ],
    dataKey: 'uuid',
    showViewButton: false,
    showEditButton: true,
    showDeleteButton: false,
    scrollHeight: '320px',
  }));

  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);

    this.service.getChart(id).subscribe({
      next: (chart) => {
        this.chart.set(chart);
        this.toothRecords.set(chart.tooth_records ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load dental chart.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/odontology']);
  }

  onEditChart(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/odontology', id, 'edit']);
  }

  onAddToothRecord(): void {
    this.selectedToothRecord.set(null);
    this.showToothForm.set(true);
  }

  onEditToothRecord(item: ToothRecord): void {
    this.selectedToothRecord.set(item);
    this.showToothForm.set(true);
  }

  onToothSaved(): void {
    this.showToothForm.set(false);
    this.selectedToothRecord.set(null);
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.load(id);
  }

  onToothCancelled(): void {
    this.showToothForm.set(false);
    this.selectedToothRecord.set(null);
  }
}
