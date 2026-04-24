import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./report-list/reports-list').then((m) => m.ReportsList),
  },
  {
    path: 'new',
    loadComponent: () => import('./report-form/reports-form').then((m) => m.ReportsForm),
  },
  {
    path: ':uuid',
    loadComponent: () => import('./report-details/reports-details').then((m) => m.ReportsDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () => import('./report-form/reports-form').then((m) => m.ReportsForm),
  },
];
