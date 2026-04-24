import { Routes } from '@angular/router';

export const odontologyRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./chart-list/chart-list').then((m) => m.ChartList),
  },
  {
    path: 'new',
    loadComponent: () => import('./chart-form/chart-form').then((m) => m.ChartForm),
  },
  {
    path: ':uuid',
    loadComponent: () => import('./chart-details/chart-details').then((m) => m.ChartDetails),
  },
  {
    path: ':uuid/edit',
    loadComponent: () => import('./chart-form/chart-form').then((m) => m.ChartForm),
  },
];
