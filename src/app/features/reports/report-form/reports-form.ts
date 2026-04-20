import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ReportsService } from '../services/reports.service';
import { ReportPayload } from '../models/report.model';
import { ConsultationsService } from '../../consultations/services/consultations.service';
import { PrescriptionsService } from '../../prescriptions/services/prescriptions.service';
import { TreatmentPlansService } from '../../treatment-plans/services/treatment-plans.service';
import { DocumentsService } from '../../documents/services/documents.service';

import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-reports-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './reports-form.html',
  styleUrl: './reports-form.scss',
})
export class ReportsForm {
  private readonly service = inject(ReportsService);
  private readonly consultationsService = inject(ConsultationsService);
  private readonly prescriptionsService = inject(PrescriptionsService);
  private readonly treatmentPlansService = inject(TreatmentPlansService);
  private readonly documentsService = inject(DocumentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);

  consultationsLoading = signal(false);
  prescriptionsLoading = signal(false);
  treatmentPlansLoading = signal(false);
  documentsLoading = signal(false);

  consultationOptions = signal<CdssSelectOption[]>([]);
  prescriptionOptions = signal<CdssSelectOption[]>([]);
  treatmentPlanOptions = signal<CdssSelectOption[]>([]);
  documentOptions = signal<CdssSelectOption[]>([]);

  allPrescriptions = signal<any[]>([]);
  allTreatmentPlans = signal<any[]>([]);
  allDocuments = signal<any[]>([]);

  form = new FormGroup({
    consultation_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    report_type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    prescription_summary_id: new FormControl(''),
    treatment_plan_summary_id: new FormControl(''),
    document_ids: new FormControl<string[]>([], { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Report' : 'New Report',
    formGroup: this.form,
    showToolbar: true,
    fieldsInRow: 2,
    toolbar: {
      showBack: true,
      showReset: true,
      showSave: true,
      saveLabel: this.isEditMode ? 'Update' : 'Create',
    },
    groups: [
      {
        name: 'Report Information',
        fieldsInRow: 2,
        fields: [
          {
            name: 'consultation_id',
            label: 'Consultation',
            type: 'select',
            options: this.consultationOptions(),
          },
          {
            name: 'report_type',
            label: 'Report Type',
            type: 'select',
            options: [
              { label: 'Clinical Summary', value: 'clinical_summary' },
              { label: 'Prescription Report', value: 'prescription_report' },
              { label: 'Treatment Plan Report', value: 'treatment_plan_report' },
              { label: 'Discharge Summary', value: 'discharge_summary' },
              { label: 'General Report', value: 'general_report' },
            ],
          },
          {
            name: 'prescription_summary_id',
            label: 'Prescription Summary',
            type: 'select',
            options: this.prescriptionOptions(),
          },
          {
            name: 'treatment_plan_summary_id',
            label: 'Treatment Plan Summary',
            type: 'select',
            options: this.treatmentPlanOptions(),
          },
          {
            name: 'document_ids',
            label: 'Documents',
            type: 'multi-select',
            options: this.documentOptions(),
            fullWidth: true,
          },
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
          {
            name: 'is_active',
            label: 'Active',
            type: 'boolean',
            fullWidth: true,
          },
        ],
      },
    ],
  }));

  constructor() {
    this.loadBaseOptions();

    this.form.get('consultation_id')?.valueChanges.subscribe((consultationUuid) => {
      this.filterDependentOptions(consultationUuid || '');
    });

    effect(() => {
      const consultationUuid = this.form.get('consultation_id')?.value || '';
      this.filterDependentOptions(consultationUuid);
    });

    if (this.isEditMode && this.uuid) {
      this.loadReport(this.uuid);
    }
  }

  loadBaseOptions(): void {
    this.loadConsultations();
    this.loadPrescriptions();
    this.loadTreatmentPlans();
    this.loadDocuments();
  }

  loadConsultations(): void {
    this.consultationsLoading.set(true);

    this.consultationsService.getConsultations().subscribe({
      next: (response) => {
        const consultations = Array.isArray(response) ? response : (response.results ?? []);

        this.consultationOptions.set(
          consultations.map((item: any) => ({
            label:
              item.consultation_number || item.consultation_date || item.patient_name || item.uuid,
            value: item.uuid,
          })),
        );

        this.consultationsLoading.set(false);
      },
      error: () => {
        this.consultationsLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load consultations.',
        });
      },
    });
  }

  loadPrescriptions(): void {
    this.prescriptionsLoading.set(true);

    this.prescriptionsService.getPrescriptions().subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : (response.results ?? []);
        this.allPrescriptions.set(items);
        this.prescriptionsLoading.set(false);
        this.filterDependentOptions(this.form.get('consultation_id')?.value || '');
      },
      error: () => {
        this.prescriptionsLoading.set(false);
      },
    });
  }

  loadTreatmentPlans(): void {
    this.treatmentPlansLoading.set(true);

    this.treatmentPlansService.getTreatmentPlans().subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : (response.results ?? []);
        this.allTreatmentPlans.set(items);
        this.treatmentPlansLoading.set(false);
        this.filterDependentOptions(this.form.get('consultation_id')?.value || '');
        console.log('Treatment plans response:', items);
      },
      error: () => {
        this.treatmentPlansLoading.set(false);
      },
    });
  }

  loadDocuments(): void {
    this.documentsLoading.set(true);

    this.documentsService.getDocuments().subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : (response.results ?? []);
        this.allDocuments.set(items);
        this.documentsLoading.set(false);
        this.filterDependentOptions(this.form.get('consultation_id')?.value || '');
      },
      error: () => {
        this.documentsLoading.set(false);
      },
    });
  }
  private clearInvalidDependentSelections(
    prescriptions: any[],
    treatmentPlans: any[],
    documents: any[],
  ): void {
    const validPrescriptionIds = new Set(prescriptions.map((item) => item.uuid));
    const validTreatmentPlanIds = new Set(treatmentPlans.map((item) => item.uuid));
    const validDocumentIds = new Set(documents.map((item) => item.uuid));

    const currentPrescriptionId = this.form.get('prescription_summary_id')?.value || '';
    const currentTreatmentPlanId = this.form.get('treatment_plan_summary_id')?.value || '';
    const currentDocumentIds = this.form.get('document_ids')?.value || [];

    if (currentPrescriptionId && !validPrescriptionIds.has(currentPrescriptionId)) {
      this.form.patchValue({ prescription_summary_id: '' }, { emitEvent: false });
    }

    if (currentTreatmentPlanId && !validTreatmentPlanIds.has(currentTreatmentPlanId)) {
      this.form.patchValue({ treatment_plan_summary_id: '' }, { emitEvent: false });
    }

    const filteredDocumentIds = currentDocumentIds.filter((id: string) => validDocumentIds.has(id));

    if (filteredDocumentIds.length !== currentDocumentIds.length) {
      this.form.patchValue({ document_ids: filteredDocumentIds }, { emitEvent: false });
    }
  }

  filterDependentOptions(consultationUuid: string): void {
    const belongsToConsultation = (item: any): boolean => {
      const itemConsultation =
        item?.consultation_id || item?.consultation || item?.consultation_uuid || '';

      return !consultationUuid || itemConsultation === consultationUuid;
    };

    const prescriptions = this.allPrescriptions().filter((item: any) =>
      belongsToConsultation(item),
    );

    const treatmentPlans = this.allTreatmentPlans().filter((item: any) =>
      belongsToConsultation(item),
    );

    const documents = this.allDocuments().filter((item: any) => belongsToConsultation(item));

    this.prescriptionOptions.set(
      prescriptions.map((item: any) => ({
        label: `${item.medication || 'Prescription'}${item.dosage ? ` - ${item.dosage}` : ''}`,
        value: item.uuid,
      })),
    );

    this.treatmentPlanOptions.set(
      treatmentPlans.map((item: any) => ({
        label: `${item.treatment_type || 'Plan'}${item.status ? ` - ${item.status}` : ''}`,
        value: item.uuid,
      })),
    );

    this.documentOptions.set(
      documents.map((item: any) => ({
        label: `${item.document_type || 'Document'}${item.description ? ` - ${item.description}` : ''}`,
        value: item.uuid,
      })),
    );

    this.clearInvalidDependentSelections(prescriptions, treatmentPlans, documents);
  }

  loadReport(uuid: string): void {
    this.loading.set(true);

    this.service.getReport(uuid).subscribe({
      next: (report) => {
        this.form.patchValue({
          consultation_id: report.consultation ?? '',
          report_type: report.report_type ?? '',
          prescription_summary_id: report.prescription_summary?.uuid ?? '',
          treatment_plan_summary_id: report.treatment_plan_summary?.uuid ?? '',
          document_ids: report.documents?.map((item) => item.uuid) ?? [],
          notes: report.notes ?? '',
          is_active: report.is_active ?? true,
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load report details.',
        });
      },
    });
  }

  save(payload: unknown): void {
    const raw = payload as {
      consultation_id: string;
      report_type: string;
      prescription_summary_id?: string;
      treatment_plan_summary_id?: string;
      document_ids?: string[];
      notes?: string;
      is_active?: boolean;
    };

    const reportPayload: ReportPayload = {
      consultation_id: raw.consultation_id,
      report_type: raw.report_type,
      prescription_summary_id: raw.prescription_summary_id || null,
      treatment_plan_summary_id: raw.treatment_plan_summary_id || null,
      document_ids: raw.document_ids || [],
      notes: raw.notes || '',
      is_active: raw.is_active ?? true,
    };

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.service.updateReport(this.uuid, reportPayload)
        : this.service.createReport(reportPayload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Report ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/reports', res.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} report.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/reports', this.uuid]);
      return;
    }

    this.router.navigate(['/reports']);
  }
}
