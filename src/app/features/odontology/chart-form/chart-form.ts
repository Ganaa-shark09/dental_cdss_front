import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { OdontologyService } from '../services/odontology.service';
import { DentalChartPayload } from '../models/odontology.model';
import { ConsultationsService } from '../../consultations/services/consultations.service';
import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import {
  CdssFormConfig,
  CdssSelectOption,
} from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-chart-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './chart-form.html',
  styleUrl: './chart-form.scss',
})
export class ChartForm {
  private readonly service = inject(OdontologyService);
  private readonly consultationsService = inject(ConsultationsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

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
    notes: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.isEditMode ? 'Edit Dental Chart' : 'New Dental Chart',
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
        name: 'Dental Chart',
        fieldsInRow: 2,
        fields: [
          {
            name: 'consultation_id',
            label: 'Consultation',
            type: 'select',
            options: this.consultationOptions(),
            readonly: this.isEditMode,
          },
          {
            name: 'is_active',
            label: 'Active',
            type: 'boolean',
            fullWidth: true,
          },
          {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            rows: 4,
            fullWidth: true,
          },
        ],
      },
    ],
  }));

  constructor() {
    this.loadConsultations();

    if (this.isEditMode && this.uuid) {
      this.loadChart(this.uuid);
    }
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
      },
    });
  }

  loadChart(uuid: string): void {
    this.loading.set(true);

    this.service.getChart(uuid).subscribe({
      next: (chart) => {
        this.form.patchValue({
          consultation_id: chart.consultation ?? '',
          notes: chart.notes ?? '',
          is_active: chart.is_active ?? true,
        });
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

  save(payload: unknown): void {
    const chartPayload = payload as DentalChartPayload;

    this.saving.set(true);

    const request$ =
      this.isEditMode && this.uuid
        ? this.service.updateChart(this.uuid, chartPayload)
        : this.service.createChart(chartPayload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.isEditMode ? 'Updated' : 'Created',
          detail: `Dental chart ${this.isEditMode ? 'updated' : 'created'} successfully.`,
        });
        this.router.navigate(['/odontology', res.uuid]);
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${this.isEditMode ? 'update' : 'create'} dental chart.`,
        });
      },
    });
  }

  onBack(): void {
    if (this.isEditMode && this.uuid) {
      this.router.navigate(['/odontology', this.uuid]);
      return;
    }

    this.router.navigate(['/odontology']);
  }
}
