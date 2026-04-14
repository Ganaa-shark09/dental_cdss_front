import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import {
  CdssFormConfig,
  CdssFormFieldConfig,
  CdssFormGroupConfig,
  CdssFormSubmitEvent,
} from './cdss-form.types';
import { CdssBackButton } from '../../buttons/cdss-back-button/cdss-back-button';
import { CdssSaveButton } from '../../buttons/cdss-save-button/cdss-save-button';

@Component({
  selector: 'app-cdss-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    FieldsetModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    TextareaModule,
    SkeletonModule,
    TagModule,
    CdssBackButton,
    CdssSaveButton,
  ],
  templateUrl: './cdss-form.html',
  styleUrl: './cdss-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdssForm {
  private readonly cdr = inject(ChangeDetectorRef);

  config = input.required<CdssFormConfig>();
  loading = input<boolean>(false);
  disableOnInvalid = input<boolean>(false);

  submit = output<CdssFormSubmitEvent>();
  back = output<void>();
  reset = output<void>();

  constructor() {
    effect(() => {
      const cfg = this.config();
      this.applyReadonlyStates(cfg);
    });
  }

  get formGroup(): FormGroup {
    return this.config().formGroup;
  }

  get toolbar() {
    return this.config().toolbar ?? {};
  }

  getResolvedGroups(): CdssFormGroupConfig[] {
    const cfg = this.config();

    if (cfg.groups?.length) {
      return cfg.groups.map((group) => ({
        ...group,
        fieldsInRow: group.fieldsInRow ?? cfg.fieldsInRow ?? 1,
      }));
    }

    if (cfg.fields?.length) {
      return [
        {
          name: cfg.title ? `${cfg.title} Details` : 'Details',
          fields: cfg.fields,
          fieldsInRow: cfg.fieldsInRow ?? 1,
        },
      ];
    }

    return [];
  }

  getColumnClass(field: CdssFormFieldConfig, group?: CdssFormGroupConfig): string {
    if (field.fullWidth) {
      return 'col-12';
    }

    const fieldsInRow = group?.fieldsInRow || this.config().fieldsInRow || 1;
    const colSize = Math.max(1, Math.floor(12 / fieldsInRow));
    return `col-12 md:col-${colSize}`;
  }

  isFieldVisible(field: CdssFormFieldConfig): boolean {
    const hidden = field.hidden;

    if (typeof hidden === 'function') {
      return !hidden(this.formGroup);
    }

    return !hidden;
  }

  getControl(fieldName: string): AbstractControl | null {
    return this.formGroup.get(fieldName);
  }

  getFormControl(fieldName: string): FormControl {
    const control = this.formGroup.get(fieldName);

    if (control instanceof FormControl) {
      return control;
    }

    throw new Error(`Control "${fieldName}" is not a FormControl.`);
  }

  isReadonly(field: CdssFormFieldConfig): boolean {
    return !!field.readonly;
  }

  isFieldRequired(fieldName: string): boolean {
    const control = this.getControl(fieldName);
    if (!control?.validator) return false;

    const testControl = new FormControl(null);
    const errors = control.validator(testControl);
    return !!errors?.['required'];
  }

  getFieldErrors(field: CdssFormFieldConfig): string[] {
    if (field.errorGetter) {
      return field.errorGetter(field.name, this.formGroup) ?? [];
    }

    const control = this.getControl(field.name);
    if (!control || !control.touched || !control.invalid) {
      return [];
    }

    const errors: string[] = [];

    if (control.errors?.['required']) {
      errors.push(`${field.label} is required.`);
    }

    if (control.errors?.['email']) {
      errors.push(`Enter a valid ${field.label.toLowerCase()}.`);
    }

    if (control.errors?.['min']) {
      errors.push(`Value must be at least ${control.errors['min'].min}.`);
    }

    if (control.errors?.['max']) {
      errors.push(`Value must be at most ${control.errors['max'].max}.`);
    }

    return errors;
  }

  onFieldInput(field: CdssFormFieldConfig, value: unknown): void {
    field.onChange?.(value, this.formGroup);
  }

  onFieldFilter(field: CdssFormFieldConfig, query: string): void {
    field.onFilter?.(query, this.formGroup);
  }

  onLinkClick(event: Event, field: CdssFormFieldConfig): void {
    event.preventDefault();
    event.stopPropagation();
    field.onLinkClick?.(field, this.formGroup);
  }

  onFieldButtonClick(field: CdssFormFieldConfig): void {
    field.buttonConfig?.action(this.formGroup);
  }

  onBackClick(): void {
    this.back.emit();
  }

  onResetClick(): void {
    this.formGroup.reset();
    this.markAllAsUntouched(this.formGroup);
    this.reset.emit();
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.markAllAsTouched(this.formGroup);
      this.scrollToFirstInvalidField(this.formGroup);
      this.cdr.markForCheck();
      return;
    }

    const rawValue = this.formGroup.getRawValue();

    this.submit.emit({
      value: this.formGroup.value,
      rawValue,
    });
  }

  private applyReadonlyStates(cfg: CdssFormConfig): void {
    const allFields: CdssFormFieldConfig[] = [
      ...(cfg.fields ?? []),
      ...(cfg.groups?.flatMap((group) => group.fields) ?? []),
    ];

    for (const field of allFields) {
      const control = this.formGroup.get(field.name);

      if (!(control instanceof FormControl)) {
        continue;
      }

      const shouldDisable = !!field.readonly;

      if (shouldDisable && control.enabled) {
        control.disable({ emitEvent: false });
      } else if (!shouldDisable && control.disabled) {
        control.enable({ emitEvent: false });
      }
    }
  }

  private markAllAsTouched(control: AbstractControl): void {
    control.markAsTouched();

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach((child) => this.markAllAsTouched(child));
    }
  }

  private markAllAsUntouched(control: AbstractControl): void {
    control.markAsUntouched();

    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach((child) => this.markAllAsUntouched(child));
    }
  }

  private scrollToFirstInvalidField(formGroup: FormGroup): void {
    const firstInvalidControlName = this.findFirstInvalidControl(formGroup);

    if (!firstInvalidControlName) return;

    const element =
      document.querySelector(`[id="${firstInvalidControlName}"]`) ||
      document.querySelector(`[formControlName="${firstInvalidControlName}"]`);

    if (element instanceof HTMLElement) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      setTimeout(() => element.focus(), 250);
    }
  }

  private findFirstInvalidControl(formGroup: FormGroup, prefix = ''): string | null {
    for (const key of Object.keys(formGroup.controls)) {
      const control = formGroup.get(key);
      const fieldPath = prefix ? `${prefix}.${key}` : key;

      if (control instanceof FormGroup) {
        const nestedInvalid = this.findFirstInvalidControl(control, fieldPath);
        if (nestedInvalid) return nestedInvalid;
      } else if (control?.invalid) {
        return fieldPath;
      }
    }

    return null;
  }
}
