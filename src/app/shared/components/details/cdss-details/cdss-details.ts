import { Component, TemplateRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RouterModule } from '@angular/router';

export type CdssDetailValueType =
  | 'text'
  | 'tag'
  | 'link'
  | 'external-link'
  | 'custom'
  | 'longtext'
  | 'tags';

export type CdssDetailRow = {
  label?: string;
  value: string | null | undefined;
  type?: CdssDetailValueType;
  fullWidth?: boolean;
  tagSeverity?: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';
  routerLink?: string | any[];
  externalLink?: string;
  customTemplate?: TemplateRef<unknown> | null;
  tags?: string[];
  tagsOutlined?: boolean;
};

@Component({
  selector: 'app-cdss-details',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, RouterModule],
  templateUrl: './cdss-details.html',
  styleUrl: './cdss-details.scss',
})
export class CdssDetails {
  title = input<string>('');
  subtitle = input<string>('');
  rows = input<CdssDetailRow[]>([]);
  centerContent = input<boolean>(false);

  getDisplayValue(row: CdssDetailRow): string {
    if (!row.value || !row.value.trim || row.value.trim() === '') {
      return '—';
    }

    return row.value;
  }
}
