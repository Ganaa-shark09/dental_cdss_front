import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { AuditLogsService } from '../services/audit-logs.service';
import { AuditLogRecord } from '../models/audit-log.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';

@Component({
  selector: 'app-audit-logs-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton],
  templateUrl: './audit-logs-details.html',
})
export class AuditLogsDetails {
  private readonly service = inject(AuditLogsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<AuditLogRecord | null>(null);

  rows = computed<CdssDetailRow[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Model', value: d.model_name, type: 'text' },
      { label: 'Field', value: d.field_name, type: 'text' },
      { label: 'Old Value', value: d.old_value || '—', type: 'longtext', fullWidth: true },
      { label: 'New Value', value: d.new_value || '—', type: 'longtext', fullWidth: true },
      { label: 'User', value: d.user?.full_name || d.user?.email || '—', type: 'text' },
      { label: 'Timestamp', value: d.timestamp, type: 'text' },
      { label: 'Record ID', value: d.record_id, type: 'text' },
    ];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.load(id);
  }

  load(id: string): void {
    this.service.getLog(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load audit log.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/audit-logs']);
  }
}
