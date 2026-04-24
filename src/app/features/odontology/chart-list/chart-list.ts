import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { OdontologyService } from '../services/odontology.service';
import { DentalChart } from '../models/odontology.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';

@Component({
  selector: 'app-chart-list',
  standalone: true,
  imports: [CardModule, CdssTable, CdssNewButton],
  templateUrl: './chart-list.html',
  styleUrl: './chart-list.scss',
})
export class ChartList {
  private readonly service = inject(OdontologyService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<DentalChart[]>([]);
  loading = signal(false);

  config = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'consultation_number', header: 'Consultation', type: 'text', sortable: true },
      { field: 'notes', header: 'Notes', type: 'text' },
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

  load(): void {
    this.loading.set(true);

    this.service.getCharts().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load dental charts.',
        });
      },
    });
  }

  onCreate(): void {
    this.router.navigate(['/odontology/new']);
  }

  onView(item: DentalChart): void {
    if (!item.uuid) return;
    this.router.navigate(['/odontology', item.uuid]);
  }

  onEdit(item: DentalChart): void {
    if (!item.uuid) return;
    this.router.navigate(['/odontology', item.uuid, 'edit']);
  }
}
