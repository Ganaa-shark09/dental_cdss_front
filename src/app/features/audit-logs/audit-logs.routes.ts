import { Routes } from '@angular/router';

export const auditLogsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./audit-logs-list/audit-logs-list').then((m) => m.AuditLogsList),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./audit-logs-details/audit-logs-details').then((m) => m.AuditLogsDetails),
  },
];
