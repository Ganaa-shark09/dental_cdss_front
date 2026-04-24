import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

import { OdontologyService } from '../services/odontology.service';
import { ToothRecord, ToothRecordPayload } from '../models/odontology.model';
import { CdssForm } from '../../../shared/components/form/cdss-form/cdss-form';
import { CdssFormConfig } from '../../../shared/components/form/cdss-form/cdss-form.types';

@Component({
  selector: 'app-tooth-record-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, CdssForm],
  templateUrl: './tooth-record-form.html',
  styleUrl: './tooth-record-form.scss',
})
export class ToothRecordForm {
  private readonly service = inject(OdontologyService);
  private readonly messageService = inject(MessageService);

  chartUuid = input.required<string>();
  toothRecord = input<ToothRecord | null>(null);

  saved = output<void>();
  cancelled = output<void>();

  saving = signal(false);

  form = new FormGroup({
    tooth_number: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    condition: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    surfaces: new FormControl<string[]>([], { nonNullable: true }),
    mobility_grade: new FormControl('', { nonNullable: true }),
    percussion_tenderness: new FormControl(false, { nonNullable: true }),
    palpation_tenderness: new FormControl(false, { nonNullable: true }),
    probing_depth_summary: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  config = computed<CdssFormConfig>(() => ({
    title: this.toothRecord() ? 'Edit Tooth Record' : 'Add Tooth Record',
    formGroup: this.form,
    showToolbar: true,
    fieldsInRow: 2,
    toolbar: {
      showBack: true,
      showReset: true,
      showSave: true,
      saveLabel: this.toothRecord() ? 'Update' : 'Add',
    },
    groups: [
      {
        name: 'Tooth Record',
        fieldsInRow: 2,
        fields: [
          {
            name: 'tooth_number',
            label: 'Tooth Number',
            type: 'text',
            readonly: !!this.toothRecord(),
          },
          {
            name: 'condition',
            label: 'Condition',
            type: 'select',
            options: [
              { label: 'Sound', value: 'SOUND' },
              { label: 'Caries', value: 'CARIES' },
              { label: 'Filled', value: 'FILLED' },
              { label: 'Missing', value: 'MISSING' },
              { label: 'Fractured', value: 'FRACTURED' },
              { label: 'Mobile', value: 'MOBILE' },
              { label: 'Root Stump', value: 'ROOT_STUMP' },
              { label: 'Impacted', value: 'IMPACTED' },
              { label: 'Attrition', value: 'ATTRITION' },
              { label: 'Abrasion', value: 'ABRASION' },
              { label: 'Abfraction', value: 'ABFRACTION' },
              { label: 'Discolored', value: 'DISCOLORED' },
            ],
          },
          {
            name: 'surfaces',
            label: 'Surfaces',
            type: 'multi-select',
            options: [
              { label: 'Mesial', value: 'MESIAL' },
              { label: 'Distal', value: 'DISTAL' },
              { label: 'Occlusal', value: 'OCCLUSAL' },
              { label: 'Buccal', value: 'BUCCAL' },
              { label: 'Lingual', value: 'LINGUAL' },
              { label: 'Labial', value: 'LABIAL' },
              { label: 'Incisal', value: 'INCISAL' },
              { label: 'Cervical', value: 'CERVICAL' },
            ],
            fullWidth: true,
          },
          {
            name: 'mobility_grade',
            label: 'Mobility Grade',
            type: 'text',
          },
          {
            name: 'probing_depth_summary',
            label: 'Probing Depth Summary',
            type: 'text',
          },
          {
            name: 'percussion_tenderness',
            label: 'Percussion Tenderness',
            type: 'boolean',
          },
          {
            name: 'palpation_tenderness',
            label: 'Palpation Tenderness',
            type: 'boolean',
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
    effect(() => {
      const record = this.toothRecord();
      if (!record) {
        this.form.reset({
          tooth_number: '',
          condition: '',
          surfaces: [],
          mobility_grade: '',
          percussion_tenderness: false,
          palpation_tenderness: false,
          probing_depth_summary: '',
          notes: '',
          is_active: true,
        });
        return;
      }

      this.form.patchValue({
        tooth_number: record.tooth_number ?? '',
        condition: record.condition ?? '',
        surfaces: record.surfaces ?? [],
        mobility_grade: record.mobility_grade ?? '',
        percussion_tenderness: record.percussion_tenderness ?? false,
        palpation_tenderness: record.palpation_tenderness ?? false,
        probing_depth_summary: record.probing_depth_summary ?? '',
        notes: record.notes ?? '',
        is_active: record.is_active ?? true,
      });
    });
  }

  save(payload: unknown): void {
    const formPayload = payload as ToothRecordPayload;
    const chartUuid = this.chartUuid();
    const existing = this.toothRecord();

    this.saving.set(true);

    const request$ = existing?.uuid
      ? this.service.updateToothRecord(chartUuid, existing.uuid, formPayload)
      : this.service.createToothRecord(chartUuid, formPayload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: existing ? 'Updated' : 'Created',
          detail: `Tooth record ${existing ? 'updated' : 'created'} successfully.`,
        });
        this.saved.emit();
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Save failed',
          detail: `Unable to ${existing ? 'update' : 'create'} tooth record.`,
        });
      },
    });
  }

  onBack(): void {
    this.cancelled.emit();
  }
}
