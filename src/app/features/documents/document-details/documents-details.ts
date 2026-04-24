import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { DocumentsService } from '../services/documents.service';
import { DocumentRecord } from '../models/document.model';
import {
  CdssDetails,
  CdssDetailRow,
} from '../../../shared/components/details/cdss-details/cdss-details';
import { CdssBackButton } from '../../../shared/components/buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../../shared/components/buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-documents-details',
  standalone: true,
  imports: [CardModule, CdssDetails, CdssBackButton, CdssSaveButton],
  templateUrl: './documents-details.html',
  styleUrl: './documents-details.scss',
})
export class DocumentsDetails {
  private readonly service = inject(DocumentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  data = signal<DocumentRecord | null>(null);

  rows = computed<CdssDetailRow[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Title', value: d.title || '—', type: 'text', fullWidth: false },
      { label: 'Type', value: d.document_type || '—', type: 'text', fullWidth: false },
      { label: 'Consultation Number', value: d.consultation_number || '—', type: 'text', fullWidth: false },
      { label: 'Clinic', value: d.clinic_name || '—', type: 'text', fullWidth: false },
      { label: 'Consultation', value: d.consultation || '—', type: 'text', fullWidth: false },
      {
        label: 'Status',
        value: d.is_active ? 'Active' : 'Inactive',
        type: 'tag',
        tagSeverity: d.is_active ? 'success' : 'danger',
        fullWidth: false,
      },
      {
        label: 'File',
        value: d.original_filename || d.file_url || d.document || '—',
        type: d.file_url || d.document ? 'external-link' : 'text',
        externalLink: d.file_url || d.document || '',
        fullWidth: false,
      },
      {
        label: 'Description',
        value: d.description || '—',
        type: 'longtext',
        fullWidth: true,
      },
    ];
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.loadDocument(id);
  }

  loadDocument(id: string): void {
    this.service.getDocument(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load document details.',
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/documents']);
  }

  onEdit(): void {
    const id = this.route.snapshot.paramMap.get('uuid')!;
    this.router.navigate(['/documents', id, 'edit']);
  }
}
