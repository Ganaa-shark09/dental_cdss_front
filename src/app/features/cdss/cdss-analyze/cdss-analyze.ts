import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ConsultationsService } from '../../consultations/services/consultations.service';
import { CdssService } from '../services/cdss.service';
import { CdssEngineUpdatePayload } from '../models/cdss-engine.model';
import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-cdss-analyze',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './cdss-analyze.html',
  styleUrl: './cdss-analyze.scss',
})
export class CdssAnalyze {
  private readonly consultationsService = inject(ConsultationsService);
  private readonly cdssService = inject(CdssService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly uuid = this.route.snapshot.paramMap.get('uuid');
  readonly isEditMode = !!this.uuid;

  loading = signal(false);
  saving = signal(false);
  consultationsLoading = signal(false);
  consultationOptions = signal<CdssSelectOption[]>([]);

  form = new FormGroup({
    consultation_id: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    risk_score: new FormControl(''),
    alerts_text: new FormControl(''),
    recommendations_text: new FormControl(''),
    diagnosis_assistance: new FormControl(''),
    is_active: new FormControl(true),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit CDSS Engine' : 'Analyze Consultation',
    formGroup: this.form,
    showToolbar: true,
    fieldsInRow: 1,
    toolbar: {
      showBack: true,
      showReset: true,
      showSave: true,
      saveLabel: this.isEditMode ? 'Update' : 'Analyze Consultation',
    },
    groups: [
      {
        name: 'CDSS Engine',
        fieldsInRow: 1,
        fields: [
          {
            name: 'consultation_id',
            label: 'Consultation',
            type: 'select',
            options: this.consultationOptions(),
            readonly: this.isEditMode,
          },
          {
            name: 'risk_score',
            label: 'Risk Score',
            type: 'text',
            hidden: () => !this.isEditMode,
          },
          {
            name: 'diagnosis_assistance',
            label: 'Diagnosis Assistance',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
            hidden: () => !this.isEditMode,
          },
          {
            name: 'alerts_text',
            label: 'Alerts (one per line)',
            type: 'textarea',
            rows: 5,
            fullWidth: true,
            hidden: () => !this.isEditMode,
          },
          {
            name: 'recommendations_text',
            label: 'Recommendations (one per line)',
            type: 'textarea',
            rows: 6,
            fullWidth: true,
            hidden: () => !this.isEditMode,
          },
          {
            name: 'is_active',
            label: 'Active',
            type: 'boolean',
            fullWidth: true,
            hidden: () => !this.isEditMode,
          },
        ],
      },
    ],
  }));

  constructor() {
    this.loadConsultations();

    if (this.isEditMode && this.uuid) {
      this.loadEngine(this.uuid);
    }
  }

  loadConsultations(): void {
    this.consultationsLoading.set(true);

    this.consultationsService.getConsultations().subscribe({
      next: (response) => {
        const consultations = Array.isArray(response) ? response : (response.results ?? []);

        this.consultationOptions.set(
          consultations.map((consultation) => ({
            label:
              consultation.consultation_number ||
              consultation.consultation_date ||
              consultation.patient_name ||
              consultation.uuid,
            value: consultation.uuid,
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

  loadEngine(uuid: string): void {
    this.loading.set(true);

    this.cdssService.getCdssEngine(uuid).subscribe({
      next: (engine) => {
        this.form.patchValue({
          consultation_id: engine.consultation ?? '',
          risk_score: engine.risk_score ?? '',
          alerts_text: engine.alerts?.join('\n') ?? '',
          recommendations_text: engine.recommendations?.join('\n') ?? '',
          diagnosis_assistance: engine.diagnosis_assistance ?? '',
          is_active: engine.is_active ?? true,
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Load failed',
          detail: 'Unable to load CDSS engine.',
        });
      },
    });
  }

  save(payload: unknown): void {
    if (this.isEditMode && this.uuid) {
      const raw = payload as {
        risk_score?: string;
        alerts_text?: string;
        recommendations_text?: string;
        diagnosis_assistance?: string;
        is_active?: boolean;
      };

      const updatePayload: CdssEngineUpdatePayload = {
        risk_score: raw.risk_score || undefined,
        alerts: this.splitLines(raw.alerts_text),
        recommendations: this.splitLines(raw.recommendations_text),
        diagnosis_assistance: raw.diagnosis_assistance || '',
        is_active: raw.is_active ?? true,
      };

      this.saving.set(true);

      this.cdssService.updateCdssEngine(this.uuid, updatePayload).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'CDSS engine updated successfully.',
          });
          this.router.navigate(['/cdss', res.uuid]);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Save failed',
            detail: 'Unable to update CDSS engine.',
          });
        },
      });

      return;
    }

    this.saving.set(true);

    this.cdssService.analyzeConsultation(payload as { consultation_id: string }).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Analyzed',
          detail: 'Consultation analyzed successfully.',
        });
        this.router.navigate(['/cdss', res.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Analysis failed',
          detail: 'Unable to analyze consultation.',
        });
      },
    });
  }

  private splitLines(value?: string | null): string[] {
    return (value || '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/cdss', this.uuid]);
      return;
    }

    this.router.navigate(['/cdss']);
  }
}
