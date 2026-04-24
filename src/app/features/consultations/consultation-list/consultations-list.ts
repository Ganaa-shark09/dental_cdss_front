import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ConsultationsService } from '../services/consultations.service';
import { Consultation } from '../models/consultation.model';

import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';

@Component({
  selector: 'app-consultations-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton],
  providers: [ConfirmationService],
  templateUrl: './consultations-list.html',
})
export class ConsultationsList {
  private service = inject(ConsultationsService);
  private router = inject(Router);
  private confirm = inject(ConfirmationService);
  private toast = inject(MessageService);

  data = signal<Consultation[]>([]);
  loading = signal(false);

  config = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'consultation_number', header: 'consultation number', type: 'text' },
      { field: 'patient_name', header: 'Patient', type: 'text' },
      { field: 'staff_name', header: 'Staff', type: 'text' },
      { field: 'consultation_date', header: 'Date', type: 'date' },
      { field: 'chief_complaint', header: 'Complaint', type: 'text' },
      {
        field: 'status',
        header: 'Status',
        type: 'tag',
        tagSeverityFn: (v) =>
          v === 'completed' ? 'success' : v === 'cancelled' ? 'danger' : 'info',
      },
    ],
    dataKey: 'uuid',
    showViewButton: true,
    showEditButton: true,
  }));

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.getConsultations().subscribe((res: any) => {
      this.data.set(res.results || res);
      this.loading.set(false);
    });
  }

  create() {
    this.router.navigate(['/consultations/new']);
  }

  view(item: Consultation) {
    this.router.navigate(['/consultations', item.uuid]);
  }

  edit(item: Consultation) {
    this.router.navigate(['/consultations', item.uuid, 'edit']);
  }

  delete(item: Consultation) {
    this.confirm.confirm({
      message: 'Delete consultation?',
      accept: () => {
        this.service.deleteConsultation(item.uuid).subscribe(() => {
          this.toast.add({ severity: 'success', summary: 'Deleted' });
          this.load();
        });
      },
    });
  }
}
