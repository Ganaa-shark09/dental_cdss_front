import { Component, computed, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import { AuditLogsService } from '../services/audit-logs.service';
import { AuditLogRecord } from '../models/audit-log.model';

import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
// import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import { CdssFormConfig } from '../../../shared/components/form/cdss-form/cdss-form.types';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [CardModule, CdssTable, ReactiveFormsModule],
  templateUrl: './audit-logs-list.html',
  styleUrl: './audit-logs-list.scss',
})
export class AuditLogsList {
  private readonly service = inject(AuditLogsService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  data = signal<AuditLogRecord[]>([]);
  loading = signal(false);

  filterForm = new FormGroup({
    model_name: new FormControl(''),
    record_id: new FormControl(''),
    field_name: new FormControl(''),
    user_id: new FormControl(''),
  });

  filterConfig = computed<CdssFormConfig>(() => ({
    title: 'Filters',
    formGroup: this.filterForm,
    showToolbar: true,
    fieldsInRow: 4,
    toolbar: {
      showBack: false,
      showReset: true,
      showSave: true,
      saveLabel: 'Apply Filters',
    },
    groups: [
      {
        name: 'Filter Audit Logs',
        fieldsInRow: 4,
        fields: [
          { name: 'model_name', label: 'Model', type: 'text' },
          { name: 'record_id', label: 'Record ID', type: 'text' },
          { name: 'field_name', label: 'Field', type: 'text' },
          { name: 'user_id', label: 'User ID', type: 'text' },
        ],
      },
    ],
  }));

  tableConfig = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'model_name', header: 'Model', type: 'text', sortable: true },
      { field: 'field_name', header: 'Field', type: 'text', sortable: true },
      { field: 'old_value', header: 'Old Value', type: 'text' },
      { field: 'new_value', header: 'New Value', type: 'text' },
      {
        field: 'user.full_name',
        header: 'User',
        type: 'text',
      },
      { field: 'timestamp', header: 'Timestamp', type: 'text', sortable: true },
    ],
    dataKey: 'uuid',
    showViewButton: true,
    showEditButton: false,
    showDeleteButton: false,
    // scrollHeight: 'clamp(320px, 55vh, 420px)',
  }));

  constructor() {
    this.load();
  }

  load(params: any = {}): void {
    this.loading.set(true);

    this.service.getLogs(params).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load audit logs.',
        });
      },
    });
  }

  applyFilters(payload: any): void {
    const params = payload.rawValue;
    this.load(params);
  }

  onView(item: AuditLogRecord): void {
    if (!item.uuid) return;
    this.router.navigate(['/audit-logs', item.uuid]);
  }
}
