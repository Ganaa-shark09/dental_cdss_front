import { TableLazyLoadEvent } from 'primeng/table';

export type CdssTableColumnType = 'text' | 'tag' | 'boolean' | 'date' | 'currency' | 'custom';

export interface CdssTableColumnConfig {
  field: string;
  header: string;
  type?: CdssTableColumnType;

  sortable?: boolean;
  sortField?: string;
  displayField?: string;

  customFormat?: (value: any, row?: any) => string;
  tagSeverityFn?: (
    value: any,
    row?: any,
  ) => 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast';

  clickable?: boolean;
}

export interface CdssTableConfig {
  columns: CdssTableColumnConfig[];
  dataKey?: string;

  showViewButton?: boolean | ((row: any) => boolean);
  showEditButton?: boolean | ((row: any) => boolean);
  showDeleteButton?: boolean | ((row: any) => boolean);

  enableSelection?: boolean;
  lazy?: boolean;
  showPaginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];

  currencyCode?: string;
  currentPageReportTemplate?: string;
}
