import { Routes } from '@angular/router';

export const cdssRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./cdss-history/cdss-history').then((m) => m.CdssHistory),
  },
  {
    path: 'new',
    loadComponent: () => import('./cdss-analyze/cdss-analyze').then((m) => m.CdssAnalyze),
  },
  {
    path: ':uuid',
    loadComponent: () => import('./cdss-details/cdss-details').then((m) => m.CdssDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () => import('./cdss-analyze/cdss-analyze').then((m) => m.CdssAnalyze),
  },
];
