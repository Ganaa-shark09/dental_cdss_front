import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';

import { DocumentsService } from '../services/documents.service';
import { DocumentRecord } from '../models/document.model';
import { CdssTable } from '../../../shared/components/table/cdss-table/cdss-table';
import { CdssTableConfig } from '../../../shared/components/table/cdss-table/cdss-table.types';
import { CdssNewButton } from '../../../shared/components/buttons/cdss-new-button/cdss-new-button';
import { CdssDeleteButton } from '../../../shared/components/buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-documents-list',
  standalone: true,
  imports: [CardModule, ConfirmDialogModule, CdssTable, CdssNewButton, CdssDeleteButton],
  providers: [ConfirmationService],
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.scss',
})
export class DocumentsList {
  private readonly service = inject(DocumentsService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  data = signal<DocumentRecord[]>([]);
  loading = signal(false);
  totalRecords = signal(0);

  config = computed<CdssTableConfig>(() => ({
    columns: [
      { field: 'consultation_number', header: 'Consultation Number', type: 'text', sortable: true },
      { field: 'document_type', header: 'Type', type: 'text', sortable: true },
      { field: 'created_at', header: 'Created At', type: 'text' },
      { field: 'description', header: 'Description', type: 'text' },
      {
        field: 'is_active',
        header: 'Status',
        type: 'tag',
        customFormat: (value: boolean) => (value ? 'Active' : 'Inactive'),
        tagSeverityFn: (value: boolean) => (value ? 'success' : 'danger'),
      },
    ],
    dataKey: 'uuid',
    showViewButton: true,
    showEditButton: true,
    showDeleteButton: false,
    scrollHeight: 'clamp(320px, 55vh, 420px)',
  }));

  constructor() {
    this.loadDocuments();
  }
  private getDocumentId(item: any): string {
    return item?.uuid || item?.id || item?.document_id || '';
  }

  loadDocuments(showLoader = true): void {
    if (showLoader) this.loading.set(true);

    this.service.getDocuments().subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : (response.results ?? []);
        const total = Array.isArray(response) ? response.length : (response.count ?? items.length);

        this.data.set(items);
        this.totalRecords.set(total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load documents.',
        });
      },
    });
  }

  onLazyLoad(_: TableLazyLoadEvent): void {
    this.loadDocuments(false);
  }

  createDocument(): void {
    this.router.navigate(['/documents/new']);
  }

  onViewDocument(item: DocumentRecord): void {
    const uuid = this.getDocumentId(item);

    if (!uuid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Navigation failed',
        detail: 'Document ID is missing.',
      });
      return;
    }

    this.router.navigate(['/documents', uuid]);
  }

  onEditDocument(item: DocumentRecord): void {
    const id = this.getDocumentId(item);

    if (!id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Navigation failed',
        detail: 'Document ID is missing.',
      });
      return;
    }

    this.router.navigate(['/documents', id, 'edit']);
  }

  deleteDocument(item: DocumentRecord): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading.set(true);

        const id = this.getDocumentId(item);

        if (!id) {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Delete failed',
            detail: 'Document ID is missing.',
          });
          return;
        }

        this.service.deleteDocument(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Document deleted successfully.',
            });
            this.loadDocuments(false);
          },
          error: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: 'Unable to delete document.',
            });
          },
        });
      },
    });
  }
}
