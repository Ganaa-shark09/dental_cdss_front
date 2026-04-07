import { FormGroup } from '@angular/forms';

export type CdssFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multi-select'
  | 'boolean'
  | 'textarea'
  | 'tags'
  | 'button';

export interface CdssSelectOption {
  label: string;
  value: string | number | boolean | null;
}

export interface CdssFieldLinkAction {
  label: string;
  icon?: string;
}

export interface CdssFormButtonConfig {
  label?: string;
  icon?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  outlined?: boolean;
  disabled?: boolean;
  loading?: boolean;
  action: (formGroup: FormGroup) => void;
}

export interface CdssFormFieldConfig {
  name: string;
  label: string;
  type: CdssFieldType;

  placeholder?: string;
  readonly?: boolean;
  hidden?: boolean | ((formGroup: FormGroup) => boolean);

  options?: CdssSelectOption[];

  min?: number;
  max?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;

  rows?: number;
  fullWidth?: boolean;

  tags?: string[];
  tagsOutlined?: boolean;
  tagSeverity?: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

  buttonConfig?: CdssFormButtonConfig;

  link?: CdssFieldLinkAction;
  onLinkClick?: (field: CdssFormFieldConfig, formGroup: FormGroup) => void;

  onChange?: (value: unknown, formGroup: FormGroup) => void;
  onFilter?: (query: string, formGroup: FormGroup) => void;

  errorGetter?: (fieldName: string, formGroup: FormGroup) => string[];
}
export type CdssTagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export interface CdssFormGroupConfig {
  name: string;
  fields: CdssFormFieldConfig[];
  fieldsInRow?: number;
}

export interface CdssFormToolbarConfig {
  showBack?: boolean;
  showReset?: boolean;
  showSave?: boolean;
  backLabel?: string;
  resetLabel?: string;
  saveLabel?: string;
}

export interface CdssFormConfig {
  title?: string;
  formGroup: FormGroup;
  showToolbar?: boolean;
  fieldsInRow?: number;
  groups?: CdssFormGroupConfig[];
  fields?: CdssFormFieldConfig[];
  toolbar?: CdssFormToolbarConfig;
}

export interface CdssFormSubmitEvent<T = unknown> {
  value: T;
  rawValue: T;
}
