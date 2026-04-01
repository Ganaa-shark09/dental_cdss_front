import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';

import { CdssTableColumnConfig, CdssTableConfig } from './cdss-table.types';
import { CdssDeleteButton } from '../../buttons/cdss-delete-button/cdss-delete-button';

@Component({
  selector: 'app-cdss-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ProgressBar,
    DatePipe,
    CurrencyPipe,
    CdssDeleteButton,
  ],
  templateUrl: './cdss-table.html',
  styleUrl: './cdss-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdssTable {
  data = input.required<any[]>();
  config = input.required<CdssTableConfig>();
  loading = input<boolean>(false);
  totalRecords = input<number>(0);
  selection = input<any[] | null>(null);

  view = output<any>();
  edit = output<any>();
  delete = output<any>();
  selectionChange = output<any[]>();
  lazyLoad = output<TableLazyLoadEvent>();

  @ContentChild('actions') customActionsTemplate!: TemplateRef<any>;

  selectedItems: any[] = [];

  constructor() {
    effect(() => {
      const incoming = this.selection();
      const next = Array.isArray(incoming) ? incoming : [];

      const changed =
        next.length !== this.selectedItems.length ||
        next.some((item, index) => item !== this.selectedItems[index]);

      if (changed) {
        this.selectedItems = next;
      }
    });
  }

  get dataKey(): string {
    return this.config().dataKey || 'id';
  }

  get showPaginator(): boolean {
    return this.config().showPaginator ?? true;
  }

  get rows(): number {
    return this.config().rows ?? 10;
  }

  get rowsPerPageOptions(): number[] {
    return this.config().rowsPerPageOptions ?? [10, 25, 50];
  }

  get currentPageReportTemplate(): string {
    return (
      this.config().currentPageReportTemplate ||
      'Showing {first} to {last} of {totalRecords} entries'
    );
  }

  get showViewButton(): boolean {
    const config = this.config().showViewButton;
    return config !== undefined && config !== false;
  }

  get showEditButton(): boolean {
    const config = this.config().showEditButton;
    return config !== undefined && config !== false;
  }

  get showDeleteButton(): boolean {
    const config = this.config().showDeleteButton;
    return config !== undefined && config !== false;
  }

  hasCustomActions(): boolean {
    return !!this.customActionsTemplate;
  }

  shouldShowViewButton(row: any): boolean {
    const config = this.config().showViewButton;
    return typeof config === 'function' ? config(row) : (config ?? false);
  }

  shouldShowEditButton(row: any): boolean {
    const config = this.config().showEditButton;
    return typeof config === 'function' ? config(row) : (config ?? false);
  }

  shouldShowDeleteButton(row: any): boolean {
    const config = this.config().showDeleteButton;
    return typeof config === 'function' ? config(row) : (config ?? false);
  }

  onView(item: any): void {
    this.view.emit(item);
  }

  onEdit(item: any): void {
    this.edit.emit(item);
  }

  onDelete(item: any): void {
    this.delete.emit(item);
  }

  onSelectionChanged(selectedItems: any[]): void {
    this.selectedItems = selectedItems ?? [];
    this.selectionChange.emit(this.selectedItems);
  }

  onLazyLoaded(event: TableLazyLoadEvent): void {
    if (this.loading()) {
      return;
    }

    if (event.sortField) {
      const sortPrefix = event.sortOrder === -1 ? '-' : '';
      (event as any).ordering = `${sortPrefix}${event.sortField}`;
    }

    this.lazyLoad.emit(event);
  }

  onRowClick(item: any, event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (
      target.closest(
        'button, a, input, textarea, select, label, .p-checkbox, .p-tableCheckbox, .p-button, .p-select, .p-datepicker, .p-inputtext, .p-inputnumber',
      )
    ) {
      return;
    }

    if (this.shouldShowViewButton(item)) {
      this.onView(item);
    } else if (this.shouldShowEditButton(item)) {
      this.onEdit(item);
    }
  }

  getFieldValue(obj: any, field: string): any {
    if (!obj || !field) return null;
    return field.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  getDisplayValue(row: any, col: CdssTableColumnConfig): any {
    const displayField = col.displayField || col.field;
    const rawValue = this.getFieldValue(row, displayField);

    if (col.customFormat) {
      return col.customFormat(rawValue, row);
    }

    return rawValue;
  }

  getTagSeverity(row: any, col: CdssTableColumnConfig) {
    const value = this.getFieldValue(row, col.field);
    return col.tagSeverityFn?.(value, row) ?? 'info';
  }

  getCurrencyCode(): string {
    return this.config().currencyCode || 'USD';
  }
}
